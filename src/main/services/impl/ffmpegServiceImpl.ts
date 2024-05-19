import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import {FfmpegService} from "../ffmpegService";

let ffmpegPath = '';
if (process.env.ENV === 'development') {
  ffmpegPath = path.join(__dirname, "../../node_modules/ffmpeg-static/ffmpeg")
} else {
  ffmpegPath = path.join(__dirname, "../../../ffmpeg");
}

export default class FfmpegServiceImpl implements FfmpegService {

  /**
   * check if ffmpeg is installed in  app.getPath('userData')/bin/ffmpeg
   * if not, download ffmpeg from https://ffmpeg.org/download.html
   * and install it in app.getPath('userData')/bin/ffmpeg
   */
  check = async () => {
    return true
  }

  async extractFirstFrame(input: string, output: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg.setFfmpegPath(ffmpegPath)
      ffmpeg(input)
        .frames(1)
        .on('end', function () {
          resolve(output)
        })
        .on('error', function (err) {
          console.error(err)
          reject(err);
        })
        .save(output)
    })
  }


  async extractAudio(input: string,
                     output: string,
                     onProgress: (progress: any) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.check()) {
        reject('ffmpeg not installed')
      }
      ffmpeg.setFfmpegPath(ffmpegPath)
      ffmpeg(input)
        .audioChannels(1)
        .audioFrequency(16000)
        .on('progress', (progress: any) => {
          if (progress) {
            onProgress(progress)
          }
        })
        .on('error', function (err) {
          console.error(err);
          reject(err);
        })
        .on('end', function () {
          resolve(output);
        })
        .save(output); // 输出文件路径
    });
  }

  /**
   * ffmpeg -i $1 -vf subtitles=$2 -c:v libx264 -crf 23 -preset fast -c:a copy output_video.mp4
   * @param input
   * @param subtitle
   * @param output
   * @param onProgress
   */
  async export(input: string, subtitle: string, output: string, onProgress: (progress: number) => void):Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.check()) {
        reject('ffmpeg not installed')
      }
      ffmpeg.setFfmpegPath(ffmpegPath)
      ffmpeg(input)
        .videoFilters(`subtitles=${subtitle}`)
        .videoCodec('libx264')
        .addOptions([
          '-crf', '23',
          '-preset', 'fast',
        ])
        .audioCodec('copy')
        .on('progress', (progress: any) => {
          if (progress) {
            onProgress(progress.percent)
          }
        })
        .on('error', function (err) {
          console.error(err)
          reject(err);
        })
        .on('end', function () {
          resolve(output);
        })
        .save(output);
    });
  }
}

