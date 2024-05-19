import path from "path";
import ffmpegService from "../ffmpegService";
import {getDownloadPath} from "../../utils";
import fs from "fs";
import whispercppService from "../whispercppService";
import videoDao from "../../dao/videoDao";
import {chatModelGPT35, ollama} from "../llmService";
import youtubeService from "../youtubeService";
import videoSubtitleDao from "../../dao/videoSubtitleDao";
import summaryService from "../summaryService";
import videoSummaryDao from "../../dao/videoSummaryDao";
import {VideoService} from "../videoService";
import ResponseUtils from "../../utils/sresponse";
import translationService from "../translationService";
import SubtitleEventEmitter from "./SubtitleEventEmitter";

export default class VideoServiceImpl implements VideoService {

  async prepare(url: string): Promise<VideoEntity> {
    const videoEntity = await videoDao.findByUrl(url)
    if (videoEntity) {
      return videoEntity
    }
    const u = new URL(url)
    let lastID = 0
    if (u.protocol === 'file:') {
      const input = u.pathname
      const fileName = path.basename(u.pathname)
      const output = path.join(getDownloadPath(), `${fileName}.jpg`)
      await ffmpegService.extractFirstFrame(input, output)
      lastID = await videoDao.insert({
        url: url,
        source: 'local',
        videoPath: input,
        audioPath: '',
        srtPath: '',
        title: fileName,
        author: '',
        thumbnail: "file://" + output,
      })
    } else {
      const hostname = u.hostname
      if (hostname === 'www.youtube.com') {
        const result = await this.prepareYoutube(u)
        lastID = await videoDao.insert({
          url: url,
          source: 'youtube',
          videoPath: '',
          audioPath: '',
          srtPath: '',
          title: result.title,
          author: result.authorName,
          thumbnail: result.thumbnailUrl,
          channelId: result.channelId,
          defaultLanguage: result.defaultLanguage,
        })
      } else {
        lastID = 0
      }
    }
    const result = await videoDao.get(lastID)
    return result
  }

  async prepareYoutube(url: URL): Promise<YoutubeMeta> {
    const videoId = url.searchParams.get('v')
    if (!videoId) {
      throw new Error('videoId is null')
    }
    return await youtubeService.fetchYouTubeMeta(videoId)
  }


  async getList(page: number, pageSize: number): Promise<VideoEntity[]> {
    return videoDao.findList(page, pageSize)
  }

  async getVideo(id: number) {
    const videoEntity = await videoDao.get(id)
    if (videoEntity == null) {
      return ResponseUtils.error('videoEntity is null')
    }
    //parse srtPath
    let subtitles: Subtitle[] = []
    if (videoEntity.srtPath) {
      subtitles = whispercppService.parseSRTFile(videoEntity.srtPath)
    }
    let secondarySubtitles: Subtitle[] = []
    const videoSubtitleEntities = await videoSubtitleDao.findByVideo(id)
    if (videoSubtitleEntities && videoSubtitleEntities.length > 0) {
      const videoSubtitleEntity = videoSubtitleEntities[0]
      secondarySubtitles = whispercppService.parseSRTFile(videoSubtitleEntity.srtPath)
    }
    const videoVo = {
      id: videoEntity.id,
      url: videoEntity.url,
      source: videoEntity.source,
      videoPath: videoEntity.videoPath,
      audioPath: videoEntity.audioPath,
      srtPath: videoEntity.srtPath,
      title: videoEntity.title,
      author: videoEntity.author,
      channelId: videoEntity.channelId,
      thumbnail: videoEntity.thumbnail,
      subtitles: subtitles,
      secondarySubtitles: secondarySubtitles,
    } as VideoVO
    return ResponseUtils.success(videoVo)
  }


  async startTask(event: Electron.IpcMainInvokeEvent | null, taskOptions: TaskOptions) {
    // VideoEntity
    const videoEntity = await videoDao.get(taskOptions.videoId)
    if (videoEntity == null) {
      throw new Error('videoEntity is null')
    }

    if (videoEntity.videoPath && videoEntity.audioPath && videoEntity.srtPath) {
      throw new Error('video is already processed')
    }

    let videoPath = null;
    if (videoEntity.source === 'youtube') {
      videoPath = path.join(getDownloadPath(), `${taskOptions.videoId}.mp4`)
      const youtubeVideoId = new URL(videoEntity.url).searchParams.get('v')
      // 2. 下载
      if (fs.existsSync(videoPath)) {
        //delete videoPath
        fs.unlinkSync(videoPath)
        console.log('delete videoPath')
      }
      await youtubeService.download(`https://www.youtube.com/watch?v=${youtubeVideoId}`,
        videoPath,
        "",
        "",
        (chunkLength: number, downloadedBytes: number, totalBytes: number) => {
          // console.log('download progress', chunkLength, downloadedBytes, totalBytes)
          event?.sender.send('onProgress', {
            text: 'Downloading',
            // 保留0位小数
            progress: (downloadedBytes / totalBytes * 100).toFixed(0),
          })
        })
      event?.sender.send('onProgress', {
        text: 'Downloading',
        progress: 100,
      })
      //更新UI videoPath
      event?.sender.send('onReceiveVideoPath', videoPath)
      // update videoPath
      await videoDao.update(taskOptions.videoId, {
        "videoPath": videoPath,
      })
    } else if (videoEntity.source === 'local') {
      //
      videoPath = videoEntity.videoPath
    }

    // 3. 提取音频
    const audioPath = path.join(getDownloadPath(), `${taskOptions.videoId}.wav`)
    if (fs.existsSync(audioPath)) {
      //delete audioPath
      fs.unlinkSync(audioPath)
      console.log('delete audioPath')
    }
    await ffmpegService.extractAudio(videoPath, audioPath, (progress: any) => {
      // console.log('extract audio', progress)
      event?.sender.send('onProgress', {
        text: 'Extracting audio',
        progress: Number(progress.percent).toFixed(0),
      })
    })
    event?.sender.send('onProgress', {
      text: 'Extracting audio',
      progress: 100,
    })
    await videoDao.update(taskOptions.videoId, {
      "audioPath": audioPath,
    })

    // 4. 转写
    const subtitleEventEmitter = new SubtitleEventEmitter(taskOptions, event?.sender)
    const srtPath = path.join(getDownloadPath(), `${taskOptions.videoId}`)
    if (fs.existsSync(srtPath)) {
      //delete srtPath
      fs.unlinkSync(srtPath)
      console.log('delete srtPath')
    }
    // 开始转写
    event?.sender.send('onProgress', {
      text: 'Transcribing',
      progress: 1,
    })
    await whispercppService.speechToText(taskOptions.model, audioPath, srtPath,
      (subtitle: Subtitle) => {
        subtitleEventEmitter.produceSubtitle(subtitle)
      },
      (progress: number) => {
        event?.sender.send('onProgress', {
          text: 'Transcribing',
          progress: progress,
        })
      })
    event?.sender.send('onProgress', {
      text: 'Transcribing',
      progress: 100,
    })
    subtitleEventEmitter.produceSubtitle({
      isEnd: true,
      startTime: '0',
      endTime: '0',
      startSeconds: 0,
      endSeconds: 0,
      text: '',
    })
    await videoDao.update(taskOptions.videoId, {
      "srtPath": srtPath + ".srt",
    })

    //总结
    if (taskOptions.isSummary){
      await this.getSummary(taskOptions.videoId)
    }
  }

  async getTranslatedSubtitles(event: Electron.IpcMainInvokeEvent, videoId: number, from: string, to: string) {
    const videoEntity = await videoDao.get(videoId)
    if (videoEntity == null) {
      throw new Error('videoEntity is null')
    }
    if (videoEntity.srtPath == null) {
      throw new Error('srtPath is null')
    }

    const videoSubtitleEntity = await videoSubtitleDao.findByVideoIdAndLanguage(videoId, to)
    if (videoSubtitleEntity && videoSubtitleEntity.srtPath) {
      return whispercppService.parseSRTFile(videoSubtitleEntity.srtPath)
    }

    const subtitles = whispercppService.parseSRTFile(videoEntity.srtPath)
    const translatedSubtitles: Subtitle[] = []
    let current = 0
    const total = subtitles.length

    for (const subtitle of subtitles) {
      const translatedText = await translationService.translate(subtitle.text, from, to)
      translatedSubtitles.push({
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
        startSeconds: subtitle.startSeconds,
        endSeconds: subtitle.endSeconds,
        text: translatedText,
      })

      event.sender.send('onProgress', {
        text: 'Translating',
        progress: (current++ / total * 100).toFixed(0),
      })
    }

    event.sender.send('onProgress', {
      text: 'Translating',
      progress: 100,
    })

    //save srt file
    console.log('save srt file')
    const srtPath = path.join(getDownloadPath(), `${videoId}_${to}.srt`)
    const srtContent = translatedSubtitles.map((subtitle, index) => {
      return `${index + 1}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}\n`
    }).join('\n')
    fs.writeFileSync(srtPath, srtContent)

    //save to db
    console.log('save to db')
    await videoSubtitleDao.insert({
      videoId: videoId,
      language: to,
      srtPath: srtPath,
    })
    return translatedSubtitles
  }

  async export(event: Electron.IpcMainInvokeEvent, options: {
    videoId: number,
    format: string,
    language: string,
    output: string,
  }) {
    console.log('export', options)

    const videoEntity = await videoDao.get(options.videoId)
    if (videoEntity == null) {
      throw new Error('videoEntity is null')
    }

    const videoPath = videoEntity.videoPath
    const srtPath = videoEntity.srtPath

    console.log('videoPath', videoPath, srtPath)
    try {
      const result = await ffmpegService.export(videoPath, srtPath, options.output, (progress: number) => {
        event.sender.send('onProgress', {
          text: 'Exporting',
          progress: progress,
        })
      })
      return {
        code: 200,
        msg: 'success',
        data: result,
      } as SResponse<string>
    } catch (e) {
      return {
        code: 500,
        msg: e.message,
        data: null,
      } as SResponse<string>
    }
  }

  // async getSummary(event: Electron.IpcMainInvokeEvent, options: {
  //   videoId: number,
  //   language: string
  // }): Promise<SResponse<VideoSummaryVo>> {
  //   try {
  //     const videoSummaryEntity = await videoSummaryDao.findByVideoIdAndLanguage(options.videoId, options.language)
  //     if (videoSummaryEntity) {
  //       if (videoSummaryEntity.taskStatus === 'processing') {
  //         return ResponseUtils.success({
  //           summary: null,
  //           keyInsights: null,
  //           taskStatus: 'processing'
  //         })
  //       } else if (videoSummaryEntity.taskStatus === 'error') {
  //         return ResponseUtils.error(videoSummaryEntity.error)
  //       } else if (videoSummaryEntity.taskStatus === 'processed') {
  //         const summary = JSON.parse(videoSummaryEntity.summary)
  //         return ResponseUtils.success({
  //           summary: summary.summary,
  //           keyInsights: summary.keyInsights,
  //           taskStatus: 'processed'
  //         })
  //       } else {
  //         return ResponseUtils.error('taskStatus is invalid')
  //       }
  //     }
  //
  //     const videoEntity = await videoDao.get(options.videoId)
  //     if (videoEntity == null || videoEntity.srtPath == null) {
  //       return ResponseUtils.error('videoEntity is null')
  //     }
  //     const lastID = await videoSummaryDao.insert({
  //       videoId: options.videoId,
  //       language: options.language,
  //       summary: '',
  //       taskStatus: 'processing',
  //       error: '',
  //     })
  //     const subtitles = whispercppService.parseSRTFile(videoEntity.srtPath)
  //     const text = subtitles.map(subtitle => subtitle.text).join(' ')
  //     const summary = await summaryService.summary(chatModelGPT35, text, 'en')
  //     //save to db
  //     await videoSummaryDao.update(lastID, {
  //       "summary": JSON.stringify(summary),
  //       "taskStatus": "processed",
  //     })
  //     return ResponseUtils.success({
  //       summary: summary.summary,
  //       keyInsights: summary.keyInsights,
  //       taskStatus: 'processed'
  //     })
  //   } catch (err: any) {
  //     return ResponseUtils.error(err.message)
  //   }
  // }

  async getSummary(videoId: number): Promise<SResponse<VideoSummaryVo>> {
    let lastID = null
    try {
      const videoEntity = await videoDao.get(videoId)
      if (videoEntity == null || videoEntity.srtPath == null) {
        return ResponseUtils.error('videoEntity is null')
      }
      const defaultLanguage = videoEntity.defaultLanguage
      const videoSummaryEntity = await videoSummaryDao.findByVideoIdAndLanguage(videoId, defaultLanguage)
      if (videoSummaryEntity) {
        if (videoSummaryEntity.taskStatus === 'processing') {
          return ResponseUtils.success({
            summary: null,
            keyInsights: null,
            taskStatus: 'processing'
          })
        } else if (videoSummaryEntity.taskStatus === 'error') {
          return ResponseUtils.error(videoSummaryEntity.error)
        } else if (videoSummaryEntity.taskStatus === 'processed') {
          // const summary = JSON.parse(videoSummaryEntity.summary)
          return ResponseUtils.success({
            summary: videoSummaryEntity.summary,
            // keyInsights: summary.keyInsights,
            taskStatus: 'processed'
          })
        } else {
          return ResponseUtils.error('taskStatus is invalid')
        }
      }
      lastID = await videoSummaryDao.insert({
        videoId: videoId,
        language: defaultLanguage,
        summary: '',
        taskStatus: 'processing',
        error: '',
      })

      // 从srtPah 获取字幕 或者从youtube获取字幕
      let text = null
      if (videoEntity.srtPath) {
        const subtitles = whispercppService.parseSRTFile(videoEntity.srtPath)
        text = subtitles.map(subtitle => subtitle.text).join(' ')
      } else {
        const youtubeVideoId = await youtubeService.getVideoIdFromUrl(videoEntity.url)
        const {_videoId, lang, lines} = await youtubeService.getSubtitle(youtubeVideoId)
        text = lines.map((item: any) => item.text).join(' ')
      }
      const summary = await summaryService.summary(chatModelGPT35, text, defaultLanguage)
      //save to db
      await videoSummaryDao.update(lastID, {
        "summary": summary.summary,
        "taskStatus": "processed",
      })
      return ResponseUtils.success({
        summary: summary.summary,
        taskStatus: 'processed'
      })
    } catch (err: any) {
      console.error(err)
      if (lastID) {
        await videoSummaryDao.update(lastID, {
          "taskStatus": "error",
          "error": err.message,
        })
      }
      return ResponseUtils.error(err.message)
    }
  }


  async getTranslatedSummary(videoId: number,
                             defaultLanguage: string,
                             targetLanguage: string): Promise<SResponse<VideoSummaryVo>> {
    try {
      console.log('getTranslatedSummary', videoId, defaultLanguage, targetLanguage)
      const videoSummaryEntity = await videoSummaryDao.findByVideoIdAndLanguage(videoId, targetLanguage)
      if (videoSummaryEntity) {
        if (videoSummaryEntity.taskStatus === 'processing') {
          return ResponseUtils.success({
            summary: null,
            keyInsights: null,
            taskStatus: 'processing'
          })
        } else if (videoSummaryEntity.taskStatus === 'error') {
          return ResponseUtils.error(videoSummaryEntity.error)
        } else if (videoSummaryEntity.taskStatus === 'processed') {
          return ResponseUtils.success({
            summary: videoSummaryEntity.summary,
            taskStatus: 'processed'
          })
        } else {
          return ResponseUtils.error('taskStatus is invalid')
        }
      }
      const defaultVideoSummaryEntity = await videoSummaryDao.findByVideoIdAndLanguage(videoId, defaultLanguage)
      if (defaultVideoSummaryEntity == null) {
        return ResponseUtils.error('defaultVideoSummaryEntity is null')
      }
      if (defaultVideoSummaryEntity.taskStatus !== 'processed') {
        return ResponseUtils.error('defaultVideoSummaryEntity is not processed')
      }
      const lastID = await videoSummaryDao.insert({
        videoId: videoId,
        language: targetLanguage,
        summary: '',
        taskStatus: 'processing',
        error: '',
      })
      const translatedSummary = await translationService.translate(defaultVideoSummaryEntity.summary, defaultLanguage, targetLanguage)
      //save to db
      await videoSummaryDao.update(lastID, {
        "summary": translatedSummary,
        "taskStatus": "processed",
      })
      return ResponseUtils.success({
        summary: translatedSummary,
        taskStatus: 'processed'
      })
    } catch (err: any) {
      console.error(err)
      return ResponseUtils.error(err.message)
    }
  }
}


