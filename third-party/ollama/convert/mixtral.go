package convert

import (
	"os"
	"regexp"

	"github.com/ollama/ollama/llm"
)

type MixtralModel struct {
	ModelData
}

func (m *MixtralModel) GetTensors() error {
	t, err := m.Format.GetTensors(m.Path, m.Params)
	if err != nil {
		return err
	}

	m.Tensors = []llm.Tensor{}

	pattern := `^blk\.[0-9]+\.attn_(?P<layer>q|k)\.weight$`
	re, err := regexp.Compile(pattern)
	if err != nil {
		return err
	}

	for _, l := range t {
		matches := re.FindAllStringSubmatch(l.Name, -1)
		if len(matches) > 0 {
			wt := l.WriterTo.(safetensorWriterTo)
			wt.handler = mistralLayerHandler
			l.WriterTo = wt
		}
		m.Tensors = append(m.Tensors, l)
	}

	return nil
}

func (m *MixtralModel) LoadVocab() error {
	v, err := LoadSentencePieceTokens(m.Path, m.Params)
	if err != nil {
		return err
	}
	m.Vocab = v
	return nil
}

func (m *MixtralModel) WriteGGUF() (string, error) {
	kv := llm.KV{
		"general.architecture":          "llama",
		"general.name":                  m.Name,
		"llama.block_count":             uint32(m.Params.HiddenLayers),
		"llama.context_length":          uint32(m.Params.ContextSize),
		"llama.embedding_length":        uint32(m.Params.HiddenSize),
		"llama.feed_forward_length":     uint32(m.Params.IntermediateSize),
		"llama.attention.head_count":    uint32(m.Params.AttentionHeads),
		"llama.attention.head_count_kv": uint32(m.Params.KeyValHeads),

		"llama.rope.freq_base":                   float32(m.Params.RopeFrequencyBase),
		"llama.attention.layer_norm_rms_epsilon": float32(m.Params.NormEPS),

		"llama.expert_count":      uint32(m.Params.Experts),
		"llama.expert_used_count": uint32(m.Params.ExpertsUsed),

		"llama.vocab_size":           uint32(len(m.Vocab.Tokens)),
		"llama.rope.dimension_count": uint32(m.Params.HiddenSize / m.Params.AttentionHeads),

		"general.file_type":    uint32(1),
		"tokenizer.ggml.model": "llama",

		"tokenizer.ggml.tokens":     m.Vocab.Tokens,
		"tokenizer.ggml.scores":     m.Vocab.Scores,
		"tokenizer.ggml.token_type": m.Vocab.Types,

		"tokenizer.ggml.bos_token_id":     uint32(m.Params.BoSTokenID),
		"tokenizer.ggml.eos_token_id":     uint32(m.Params.EoSTokenID),
		"tokenizer.ggml.unknown_token_id": uint32(0),
		"tokenizer.ggml.add_bos_token":    true,
		"tokenizer.ggml.add_eos_token":    false,
	}

	f, err := os.CreateTemp("", "ollama-gguf")
	if err != nil {
		return "", err
	}
	defer f.Close()

	mod := llm.NewGGUFV3(m.Params.ByteOrder)
	if err := mod.Encode(f, kv, m.Tensors); err != nil {
		return "", err
	}

	return f.Name(), nil
}
