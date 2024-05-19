import path from 'path'
import {spawn} from 'child_process'
import {LLMService} from '../llmService'
import {Ollama} from "@langchain/community/llms/ollama";


let ollamaPath = '';
if (process.env.ENV === 'development') {
  ollamaPath = path.join(__dirname, "../../third-party/ollama/ollama")
} else {
  ollamaPath = path.join(__dirname, "../../../ollama");
}

const ollama = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama3", // Default value
});

export default class OllamaService implements LLMService {

  startServer = async () => {
    return new Promise((resolve, reject) => {
      console.log('Starting Ollama server');
      const args = ['serve'];
      const child = spawn(ollamaPath, args);
      child.stdout.on('data', (data) => {
        // console.log(data.toString());
      });

      child.stderr.on('data', (data) => {
        // console.error(data.toString());
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve('Process completed successfully');
        } else {
          reject('Process completed with error');
        }
      });
    });
  }

  async stream(input: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async chat(model: string, input: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

