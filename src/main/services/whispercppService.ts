import WhispercppServiceImpl from "./impl/whispercppServiceImpl"

export interface WhispercppService {
  speechToText(modelName: string,
               input: string,
               output: string,
               onResult: (subtitle: Subtitle) => void,
               onProgress: (progress: number) => void
  ): Promise<void>

  parseSRTFile(srtPath: string): Subtitle[]
}

const whispercppService = new WhispercppServiceImpl();
export default whispercppService;
