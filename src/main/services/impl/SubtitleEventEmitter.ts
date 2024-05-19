import {EventEmitter} from "events";
import translationService from "../translationService";
import videoSubtitleDao from "../../dao/videoSubtitleDao";
import path from "path";
import {getDownloadPath} from "../../utils";
import fs from "fs";


/**
 * 字幕翻译消费者
 */
export default class SubtitleEventEmitter extends EventEmitter {
  taskOptions: TaskOptions
  sender: any | null
  queue: Subtitle[]
  secondarySubtitles: Subtitle[]
  isProcessing: boolean

  constructor(taskOptions: TaskOptions, sender: any | null) {
    super()
    this.taskOptions = taskOptions
    this.sender = sender
    this.queue = []
    this.secondarySubtitles = []
    this.isProcessing = false
    this.on('newSubtitle', this.triggerProcessSubtitle)
  }

  triggerProcessSubtitle() {
    if (!this.isProcessing) {
      this.isProcessing = true
      this.processSubtitle().then(() => {
        this.isProcessing = false
      }).catch(error => {
        console.error('Failed to process subtitle:', error);
        this.isProcessing = false;
      });
    }
  }

  produceSubtitle(subtitle: Subtitle) {
    this.queue.push(subtitle)
    this.emit('newSubtitle', subtitle)
  }

  async processSubtitle() {
    while (this.queue.length > 0) {
      const subtitle = this.queue.shift()

      if (subtitle.isEnd) {
        await this.save()
        break
      }

      if (this.taskOptions.isSyncTranslation) {
        //同步翻译
        const translatedText = await translationService.translate(subtitle.text, null, this.taskOptions.targetLanguage)
        const translatedSubtitle = {
          ...subtitle,
          text: translatedText,
        }
        this.secondarySubtitles.push(translatedSubtitle)
        this.sender?.send('onReceiveSubtitle', {
          videoId: this.taskOptions.videoId,
          subtitle: subtitle
        })
        this.sender?.send('onReceiveSecondarySubtitle', {
          videoId: this.taskOptions.videoId,
          subtitle: translatedSubtitle
        })
      } else {
        this.sender?.send('onReceiveSubtitle', {
          videoId: this.taskOptions.videoId,
          subtitle: subtitle
        })
      }
    }
  }


  async save() {
    //save srt file
    console.log('postProcess. save file and db')
    const videoSubtitle = await videoSubtitleDao.findByVideoIdAndLanguage(this.taskOptions.videoId, this.taskOptions.targetLanguage)
    if (videoSubtitle) {
      // 已经存在
      return
    }
    const lastId = await videoSubtitleDao.insert({
      videoId: this.taskOptions.videoId,
      language: this.taskOptions.targetLanguage,
      srtPath: '',
    })
    const srtPath = path.join(getDownloadPath(), `${this.taskOptions.videoId}_${this.taskOptions.targetLanguage}.srt`)
    const srtContent = this.secondarySubtitles.map((subtitle, index) => {
      return `${index + 1}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}\n`
    }).join('\n')
    fs.writeFileSync(srtPath, srtContent)
    //save to db
    await videoSubtitleDao.update(lastId, {
      "srtPath": srtPath,
    })
  }

}
