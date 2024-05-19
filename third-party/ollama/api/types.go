package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"os"
	"reflect"
	"strconv"
	"strings"
	"time"
)

type StatusError struct {
	StatusCode   int
	Status       string
	ErrorMessage string `json:"error"`
}

func (e StatusError) Error() string {
	switch {
	case e.Status != "" && e.ErrorMessage != "":
		return fmt.Sprintf("%s: %s", e.Status, e.ErrorMessage)
	case e.Status != "":
		return e.Status
	case e.ErrorMessage != "":
		return e.ErrorMessage
	default:
		// this should not happen
		return "something went wrong, please see the ollama server logs for details"
	}
}

type ImageData []byte

// GenerateRequest describes a request sent by [Client.Generate]. While you
// have to specify the Model and Prompt fields, all the other fields have
// reasonable defaults for basic uses.
type GenerateRequest struct {
	// Model is the model name; it should be a name familiar to Ollama from
	// the library at https://ollama.com/library
	Model string `json:"model"`

	// Prompt is the textual prompt to send to the model.
	Prompt string `json:"prompt"`

	// System overrides the model's default system message/prompt.
	System string `json:"system"`

	// Template overrides the model's default prompt template.
	Template string `json:"template"`

	// Context is the context parameter returned from a previous call to
	// Generate call. It can be used to keep a short conversational memory.
	Context []int `json:"context,omitempty"`

	// Stream specifies whether the response is streaming; it is true by default.
	Stream *bool `json:"stream,omitempty"`

	// Raw set to true means that no formatting will be applied to the prompt.
	Raw bool `json:"raw,omitempty"`

	// Format specifies the format to return a response in.
	Format string `json:"format"`

	// KeepAlive controls how long the model will stay loaded in memory following
	// this request.
	KeepAlive *Duration `json:"keep_alive,omitempty"`

	// Images is an optional list of base64-encoded images accompanying this
	// request, for multimodal models.
	Images []ImageData `json:"images,omitempty"`

	// Options lists model-specific options. For example, temperature can be
	// set through this field, if the model supports it.
	Options map[string]interface{} `json:"options"`
}

type ChatRequest struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	Stream    *bool     `json:"stream,omitempty"`
	Format    string    `json:"format"`
	KeepAlive *Duration `json:"keep_alive,omitempty"`

	Options map[string]interface{} `json:"options"`
}

type Message struct {
	Role    string      `json:"role"` // one of ["system", "user", "assistant"]
	Content string      `json:"content"`
	Images  []ImageData `json:"images,omitempty"`
}

type ChatResponse struct {
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Message   Message   `json:"message"`

	Done bool `json:"done"`

	Metrics
}

type Metrics struct {
	TotalDuration      time.Duration `json:"total_duration,omitempty"`
	LoadDuration       time.Duration `json:"load_duration,omitempty"`
	PromptEvalCount    int           `json:"prompt_eval_count,omitempty"`
	PromptEvalDuration time.Duration `json:"prompt_eval_duration,omitempty"`
	EvalCount          int           `json:"eval_count,omitempty"`
	EvalDuration       time.Duration `json:"eval_duration,omitempty"`
}

// Options specified in GenerateRequest, if you add a new option here add it to the API docs also
type Options struct {
	Runner

	// Predict options used at runtime
	NumKeep          int      `json:"num_keep,omitempty"`
	Seed             int      `json:"seed,omitempty"`
	NumPredict       int      `json:"num_predict,omitempty"`
	TopK             int      `json:"top_k,omitempty"`
	TopP             float32  `json:"top_p,omitempty"`
	TFSZ             float32  `json:"tfs_z,omitempty"`
	TypicalP         float32  `json:"typical_p,omitempty"`
	RepeatLastN      int      `json:"repeat_last_n,omitempty"`
	Temperature      float32  `json:"temperature,omitempty"`
	RepeatPenalty    float32  `json:"repeat_penalty,omitempty"`
	PresencePenalty  float32  `json:"presence_penalty,omitempty"`
	FrequencyPenalty float32  `json:"frequency_penalty,omitempty"`
	Mirostat         int      `json:"mirostat,omitempty"`
	MirostatTau      float32  `json:"mirostat_tau,omitempty"`
	MirostatEta      float32  `json:"mirostat_eta,omitempty"`
	PenalizeNewline  bool     `json:"penalize_newline,omitempty"`
	Stop             []string `json:"stop,omitempty"`
}

// Runner options which must be set when the model is loaded into memory
type Runner struct {
	UseNUMA   bool `json:"numa,omitempty"`
	NumCtx    int  `json:"num_ctx,omitempty"`
	NumBatch  int  `json:"num_batch,omitempty"`
	NumGQA    int  `json:"num_gqa,omitempty"`
	NumGPU    int  `json:"num_gpu,omitempty"`
	MainGPU   int  `json:"main_gpu,omitempty"`
	LowVRAM   bool `json:"low_vram,omitempty"`
	F16KV     bool `json:"f16_kv,omitempty"`
	LogitsAll bool `json:"logits_all,omitempty"`
	VocabOnly bool `json:"vocab_only,omitempty"`
	UseMMap   bool `json:"use_mmap,omitempty"`
	UseMLock  bool `json:"use_mlock,omitempty"`
	NumThread int  `json:"num_thread,omitempty"`

	// Unused: RopeFrequencyBase is ignored. Instead the value in the model will be used
	RopeFrequencyBase float32 `json:"rope_frequency_base,omitempty"`
	// Unused: RopeFrequencyScale is ignored. Instead the value in the model will be used
	RopeFrequencyScale float32 `json:"rope_frequency_scale,omitempty"`
}

type EmbeddingRequest struct {
	Model     string    `json:"model"`
	Prompt    string    `json:"prompt"`
	KeepAlive *Duration `json:"keep_alive,omitempty"`

	Options map[string]interface{} `json:"options"`
}

type EmbeddingResponse struct {
	Embedding []float64 `json:"embedding"`
}

type CreateRequest struct {
	Model        string `json:"model"`
	Path         string `json:"path"`
	Modelfile    string `json:"modelfile"`
	Stream       *bool  `json:"stream,omitempty"`
	Quantization string `json:"quantization,omitempty"`

	// Name is deprecated, see Model
	Name string `json:"name"`
}

type DeleteRequest struct {
	Model string `json:"model"`

	// Name is deprecated, see Model
	Name string `json:"name"`
}

type ShowRequest struct {
	Model    string `json:"model"`
	System   string `json:"system"`
	Template string `json:"template"`

	Options map[string]interface{} `json:"options"`

	// Name is deprecated, see Model
	Name string `json:"name"`
}

type ShowResponse struct {
	License    string       `json:"license,omitempty"`
	Modelfile  string       `json:"modelfile,omitempty"`
	Parameters string       `json:"parameters,omitempty"`
	Template   string       `json:"template,omitempty"`
	System     string       `json:"system,omitempty"`
	Details    ModelDetails `json:"details,omitempty"`
	Messages   []Message    `json:"messages,omitempty"`
}

type CopyRequest struct {
	Source      string `json:"source"`
	Destination string `json:"destination"`
}

type PullRequest struct {
	Model    string `json:"model"`
	Insecure bool   `json:"insecure,omitempty"`
	Username string `json:"username"`
	Password string `json:"password"`
	Stream   *bool  `json:"stream,omitempty"`

	// Name is deprecated, see Model
	Name string `json:"name"`
}

type ProgressResponse struct {
	Status    string `json:"status"`
	Digest    string `json:"digest,omitempty"`
	Total     int64  `json:"total,omitempty"`
	Completed int64  `json:"completed,omitempty"`
}

type PushRequest struct {
	Model    string `json:"model"`
	Insecure bool   `json:"insecure,omitempty"`
	Username string `json:"username"`
	Password string `json:"password"`
	Stream   *bool  `json:"stream,omitempty"`

	// Name is deprecated, see Model
	Name string `json:"name"`
}

type ListResponse struct {
	Models []ModelResponse `json:"models"`
}

type ModelResponse struct {
	Name       string       `json:"name"`
	Model      string       `json:"model"`
	ModifiedAt time.Time    `json:"modified_at"`
	Size       int64        `json:"size"`
	Digest     string       `json:"digest"`
	Details    ModelDetails `json:"details,omitempty"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

type GenerateResponse struct {
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Response  string    `json:"response"`

	Done    bool  `json:"done"`
	Context []int `json:"context,omitempty"`

	Metrics
}

type ModelDetails struct {
	ParentModel       string   `json:"parent_model"`
	Format            string   `json:"format"`
	Family            string   `json:"family"`
	Families          []string `json:"families"`
	ParameterSize     string   `json:"parameter_size"`
	QuantizationLevel string   `json:"quantization_level"`
}

func (m *Metrics) Summary() {
	if m.TotalDuration > 0 {
		fmt.Fprintf(os.Stderr, "total duration:       %v\n", m.TotalDuration)
	}

	if m.LoadDuration > 0 {
		fmt.Fprintf(os.Stderr, "load duration:        %v\n", m.LoadDuration)
	}

	if m.PromptEvalCount > 0 {
		fmt.Fprintf(os.Stderr, "prompt eval count:    %d token(s)\n", m.PromptEvalCount)
	}

	if m.PromptEvalDuration > 0 {
		fmt.Fprintf(os.Stderr, "prompt eval duration: %s\n", m.PromptEvalDuration)
		fmt.Fprintf(os.Stderr, "prompt eval rate:     %.2f tokens/s\n", float64(m.PromptEvalCount)/m.PromptEvalDuration.Seconds())
	}

	if m.EvalCount > 0 {
		fmt.Fprintf(os.Stderr, "eval count:           %d token(s)\n", m.EvalCount)
	}

	if m.EvalDuration > 0 {
		fmt.Fprintf(os.Stderr, "eval duration:        %s\n", m.EvalDuration)
		fmt.Fprintf(os.Stderr, "eval rate:            %.2f tokens/s\n", float64(m.EvalCount)/m.EvalDuration.Seconds())
	}
}

var ErrInvalidOpts = errors.New("invalid options")
var ErrInvalidHostPort = errors.New("invalid port specified in OLLAMA_HOST")

func (opts *Options) FromMap(m map[string]interface{}) error {
	valueOpts := reflect.ValueOf(opts).Elem() // names of the fields in the options struct
	typeOpts := reflect.TypeOf(opts).Elem()   // types of the fields in the options struct

	// build map of json struct tags to their types
	jsonOpts := make(map[string]reflect.StructField)
	for _, field := range reflect.VisibleFields(typeOpts) {
		jsonTag := strings.Split(field.Tag.Get("json"), ",")[0]
		if jsonTag != "" {
			jsonOpts[jsonTag] = field
		}
	}

	invalidOpts := []string{}
	for key, val := range m {
		if opt, ok := jsonOpts[key]; ok {
			field := valueOpts.FieldByName(opt.Name)
			if field.IsValid() && field.CanSet() {
				if val == nil {
					continue
				}

				switch field.Kind() {
				case reflect.Int:
					switch t := val.(type) {
					case int64:
						field.SetInt(t)
					case float64:
						// when JSON unmarshals numbers, it uses float64, not int
						field.SetInt(int64(t))
					default:
						return fmt.Errorf("option %q must be of type integer", key)
					}
				case reflect.Bool:
					val, ok := val.(bool)
					if !ok {
						return fmt.Errorf("option %q must be of type boolean", key)
					}
					field.SetBool(val)
				case reflect.Float32:
					// JSON unmarshals to float64
					val, ok := val.(float64)
					if !ok {
						return fmt.Errorf("option %q must be of type float32", key)
					}
					field.SetFloat(val)
				case reflect.String:
					val, ok := val.(string)
					if !ok {
						return fmt.Errorf("option %q must be of type string", key)
					}
					field.SetString(val)
				case reflect.Slice:
					// JSON unmarshals to []interface{}, not []string
					val, ok := val.([]interface{})
					if !ok {
						return fmt.Errorf("option %q must be of type array", key)
					}
					// convert []interface{} to []string
					slice := make([]string, len(val))
					for i, item := range val {
						str, ok := item.(string)
						if !ok {
							return fmt.Errorf("option %q must be of an array of strings", key)
						}
						slice[i] = str
					}
					field.Set(reflect.ValueOf(slice))
				default:
					return fmt.Errorf("unknown type loading config params: %v", field.Kind())
				}
			}
		} else {
			invalidOpts = append(invalidOpts, key)
		}
	}

	if len(invalidOpts) > 0 {
		return fmt.Errorf("%w: %v", ErrInvalidOpts, strings.Join(invalidOpts, ", "))
	}
	return nil
}

func DefaultOptions() Options {
	return Options{
		// options set on request to runner
		NumPredict: -1,

		// set a minimal num_keep to avoid issues on context shifts
		NumKeep:          4,
		Temperature:      0.8,
		TopK:             40,
		TopP:             0.9,
		TFSZ:             1.0,
		TypicalP:         1.0,
		RepeatLastN:      64,
		RepeatPenalty:    1.1,
		PresencePenalty:  0.0,
		FrequencyPenalty: 0.0,
		Mirostat:         0,
		MirostatTau:      5.0,
		MirostatEta:      0.1,
		PenalizeNewline:  true,
		Seed:             -1,

		Runner: Runner{
			// options set when the model is loaded
			NumCtx:    2048,
			NumBatch:  512,
			NumGPU:    -1, // -1 here indicates that NumGPU should be set dynamically
			NumGQA:    1,
			NumThread: 0, // let the runtime decide
			LowVRAM:   false,
			F16KV:     true,
			UseMLock:  false,
			UseMMap:   true,
			UseNUMA:   false,
		},
	}
}

type Duration struct {
	time.Duration
}

func (d *Duration) UnmarshalJSON(b []byte) (err error) {
	var v any
	if err := json.Unmarshal(b, &v); err != nil {
		return err
	}

	d.Duration = 5 * time.Minute

	switch t := v.(type) {
	case float64:
		if t < 0 {
			d.Duration = time.Duration(math.MaxInt64)
		} else {
			d.Duration = time.Duration(t * float64(time.Second))
		}
	case string:
		d.Duration, err = time.ParseDuration(t)
		if err != nil {
			return err
		}
		if d.Duration < 0 {
			d.Duration = time.Duration(math.MaxInt64)
		}
	}

	return nil
}

// FormatParams converts specified parameter options to their correct types
func FormatParams(params map[string][]string) (map[string]interface{}, error) {
	opts := Options{}
	valueOpts := reflect.ValueOf(&opts).Elem() // names of the fields in the options struct
	typeOpts := reflect.TypeOf(opts)           // types of the fields in the options struct

	// build map of json struct tags to their types
	jsonOpts := make(map[string]reflect.StructField)
	for _, field := range reflect.VisibleFields(typeOpts) {
		jsonTag := strings.Split(field.Tag.Get("json"), ",")[0]
		if jsonTag != "" {
			jsonOpts[jsonTag] = field
		}
	}

	out := make(map[string]interface{})
	// iterate params and set values based on json struct tags
	for key, vals := range params {
		if opt, ok := jsonOpts[key]; !ok {
			return nil, fmt.Errorf("unknown parameter '%s'", key)
		} else {
			field := valueOpts.FieldByName(opt.Name)
			if field.IsValid() && field.CanSet() {
				switch field.Kind() {
				case reflect.Float32:
					floatVal, err := strconv.ParseFloat(vals[0], 32)
					if err != nil {
						return nil, fmt.Errorf("invalid float value %s", vals)
					}

					out[key] = float32(floatVal)
				case reflect.Int:
					intVal, err := strconv.ParseInt(vals[0], 10, 64)
					if err != nil {
						return nil, fmt.Errorf("invalid int value %s", vals)
					}

					out[key] = intVal
				case reflect.Bool:
					boolVal, err := strconv.ParseBool(vals[0])
					if err != nil {
						return nil, fmt.Errorf("invalid bool value %s", vals)
					}

					out[key] = boolVal
				case reflect.String:
					out[key] = vals[0]
				case reflect.Slice:
					// TODO: only string slices are supported right now
					out[key] = vals
				default:
					return nil, fmt.Errorf("unknown type %s for %s", field.Kind(), key)
				}
			}
		}
	}

	return out, nil
}