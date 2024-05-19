import VideoServiceImpl from "./impl/videoServiceImpl";

export interface VideoService {
  prepare(url: string): Promise<VideoEntity>

  getList(page: number, pageSize: number): Promise<VideoEntity[]>

  getVideo(id: number): Promise<SResponse<VideoVO>>

  startTask(event: Electron.IpcMainInvokeEvent, taskOptions: TaskOptions): Promise<void>

  getTranslatedSubtitles(event: Electron.IpcMainInvokeEvent, videoId: number, from: string, to: string): Promise<Subtitle[]>

  export(event: Electron.IpcMainInvokeEvent, options: {
    videoId: number,
    format: string,
    language: string,
    output: string,
  }): Promise<SResponse<string>>


  getSummary(videoId: number): Promise<SResponse<VideoSummaryVo>>

  getTranslatedSummary(videoId: number,
                       defaultLanguage: string,
                       targetLanguage: string): Promise<SResponse<VideoSummaryVo>>


  /**
   * 遍历所有订阅，
   */
  // getTodayNews(): Promise<any[]>

  // subscribe(channelId:string):Promise<SResponse<void>>
  // unsubscribe(channelId:string):Promise<SResponse<void>>
  // getChannels(page: number, pageSize: number): Promise<VideoChannelEntity[]>
  // getChannelVideos(channelId:string, page: number, pageSize: number): Promise<Video[]>

}

const videoService = new VideoServiceImpl()
export default videoService
