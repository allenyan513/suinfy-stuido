import FfmpegServiceImpl from "./impl/ffmpegServiceImpl";

export interface FfmpegService {
  /**
   * Extract the first frame of the video
   * @param input
   * @param output
   */
  extractFirstFrame(input: string, output: string): Promise<string>

  /**
   * Extract audio from video
   * @param input
   * @param output
   * @param onProgress
   */
  extractAudio(input: string, output: string, onProgress: (progress: any) => void): Promise<string>

  /**
   * Export video with subtitle
   * @param input
   * @param subtitle
   * @param output
   * @param onProgress
   */
  export(input: string, subtitle: string, output: string, onProgress: (progress: number) => void): Promise<string>

}

const ffmpegService = new FfmpegServiceImpl();
export default ffmpegService;
