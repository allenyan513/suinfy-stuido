import path from 'path'
import {spawn} from 'child_process'
import {getModelsPath} from "../../utils";
import fs from "fs";
import {WhispercppService} from "../whispercppService";


let whispercppPath = '';
if (process.env.ENV === 'development') {
  whispercppPath = path.join(__dirname, "../../third-party/whisper-cpp/whispercpp")
} else {
  whispercppPath = path.join(__dirname, "../../../whispercpp");
}

export default class WhispercppServiceImpl implements WhispercppService {

  async speechToText(modelName: string,
                     input: string,
                     output: string,
                     onResult: (subtitle: Subtitle) => void,
                     onProgress: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('speechToText', modelName, input, output)
      const modelFilePath = path.join(getModelsPath(), modelName)
      if (!fs.existsSync(modelFilePath)) {
        reject(`$modelName not ex`)
      }
      const args = [
        '-osrt',
        '-m', modelFilePath,
        '-f', input,
        '-of', output,
        '-pp', 'true',
        '-l', 'auto'
      ];
      const child = spawn(whispercppPath, args);

      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          const res = this.parseLine(line)
          if (res) {
            onResult(res)
          }
        }
      });

      child.stderr.on('data', (data) => {
        // regex: whisper_print_progress_callback: progress =  30%
        const text = data.toString().trim()
        if (text.includes('whisper_print_progress_callback')) {
          const regex = /whisper_print_progress_callback: progress = {2}(\d+)%/;
          const result = text.match(regex);
          if (result) {
            onProgress(parseInt(result[1]))
          }
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }

  /**
   * [00:00:14.560 --> 00:00:17.020]   But I think Aaron Ward is going to be the guy
   * start seconds,
   * end seconds,
   * text
   */
  private parseLine(line: string) {
    const regex = /\[(\d+:\d+:\d+\.\d+) --> (\d+:\d+:\d+\.\d+)\]\s+(.*)/;
    const result = line.match(regex);
    if (result) {
      const subtitle: Subtitle = {
        startTime: this.formatPoint(result[1]),
        endTime: this.formatPoint(result[2]),
        startSeconds: this.timeToSeconds(result[1]),
        endSeconds: this.timeToSeconds(result[2]),
        text: result[3]
      }
      return subtitle
    }
    return null;
  }


  parseSRTFile(srtPath: string): Subtitle[] {
    const srt = fs.readFileSync(srtPath, 'utf-8')
    const lines = srt.split('\n')
    const subtitles: Subtitle[] = []
    let index = 0
    while (index < lines.length) {
      const line = lines[index]
      if (line.match(/^\d+$/)) {
        index += 1
        const timeLine = lines[index]
        const times = timeLine.split(' --> ')
        const startTime = times[0]
        const endTime = times[1]
        index += 1
        const text = lines[index]
        index += 1
        subtitles.push({
          startTime: this.formatComa(startTime),
          endTime: this.formatComa(endTime),
          startSeconds: this.timeToSeconds(this.formatComa(startTime)),
          endSeconds: this.timeToSeconds(this.formatComa(endTime)),
          text: text,
        })
      } else {
        index += 1
      }
    }
    return subtitles
  }


  /**
   * 00:00:17,720 -> 00:17
   */
  private formatComa(timeStamp: string) {
    const parts = timeStamp.split(',');
    const times = parts[0].split(':');
    return `${times[0]}:${times[1]}:${times[2]}`
  }


  /**
   * 00:00:17.720 -> 00:17
   */
  private formatPoint(timeStamp: string) {
    const parts = timeStamp.split('.');
    const times = parts[0].split(':');
    return `${times[0]}:${times[1]}:${times[2]}`
  }

  private timeToSeconds(time: string) {
    const parts = time.split(':');
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  }

}

