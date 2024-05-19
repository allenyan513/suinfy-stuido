import YoutubeServiceImpl from "./impl/youtubeServiceImpl";
import ytdl from "ytdl-core";

export interface YoutubeService {

  fetchYouTubeMeta(videoId: string): Promise<YoutubeMeta>

  getVideoIdFromUrl(url: string): string

  getSubtitle(videoId: string): Promise<Subtitle[]>

  getFormats(url: string): Promise<ytdl.videoFormat[]>

  download(url: string,
           output: string,
           filter: string,
           quality: string,
           onProgress: (chunkLength: number, downloadedBytes: number, totalBytes: number) => void): Promise<void>


  /**
   * Get the authorization URL for the user to login
   */
  getAuthorizationUrl(): string

  /**
   * @param code
   */
  handleAuthCallback(code: string): Promise<void>

  /**
   * Get the list of channels that the user is subscribed to
   */
  getMySubscribers(pageToken: string): Promise<SResponse<any>>

  /**
   * Get the list of videos from a channel
   * @param channelId
   */
  getLatestVideos(channelId: string, pageToken: string): Promise<SResponse<any>>


  /**
   *
   */
  summaryByDate(date: string): Promise<SResponse<any>>
}


const youtubeService = new YoutubeServiceImpl()
export default youtubeService
