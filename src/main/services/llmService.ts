import {ChatOpenAI} from '@langchain/openai';
import {Ollama} from "@langchain/community/llms/ollama";
import OllamaService from './impl/ollamaService';

export interface LLMService {
  startServer(): Promise<any>

  stream(input: string): Promise<any>

  chat(model: string, input: string): Promise<any>

}

export const chatModelGPT35 = new ChatOpenAI({
  openAIApiKey: `${process.env.OPEN_AI_API_KEY}`,
  modelName: 'gpt-3.5-turbo',
  maxTokens: -1,
  temperature: 1,
});
export const chatModelGPT4 = new ChatOpenAI({
  openAIApiKey: `${process.env.OPEN_AI_API_KEY}`,
  modelName: 'gpt-4-turbo',
  maxTokens: -1,
  temperature: 1,
});

export const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama3",
});

const llmService = new OllamaService();
export default llmService;
