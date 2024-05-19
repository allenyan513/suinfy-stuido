// 在全局 Window 接口中添加你的自定义 api 属性


interface Window {
  electron: {
    openDevTools(): void;
    send(channel: string, data: any): void;
    receive(channel: string, func: (event: any, ...args: any[]) => void): void;
    invoke(channel: string, ...args: any[]): Promise<any>;
    openUrl(url: string): Promise<void>;
  }

  api: {
    getVideoInfo(videoId: string): Promise<YoutubeMeta>;
    search(value: string): Promise<YoutubeMeta>;
    startTask(taskOptions: TaskOptions): Promise<void>;
    openDevTools(): void;
    onProgress(callback: (args: any) => void): void;
    onReceiveSubtitle(callback: (args: any) => void): void;
  };
}


interface TaskOptions {
  videoId: number,
  videoQuality: string,
  targetLanguage: string,
  isSummary: boolean,
  model: string
  isSyncTranslation: boolean
}

type TaskStatus = 'PROCESSING' | 'PROCESSED' | 'ERROR' | 'NO_ACCESS'
type TaskType = 'summary' | 'keyInsight'

interface BaseEntity {
  id?: string,
  created?: number,
  updated?: number
  isDeleted?: boolean
}

interface YoutubeMeta {
  videoId: string;
  title: string;
  authorName: string;
  authorUrl?: string;
  channelId?: string;
  thumbnailUrl: string;
  defaultLanguage: string;
  url: string;
}

interface TaskProgress {
  text: string,
  progress: number
}

interface Subtitle {
  startTime: string;
  endTime: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  isEnd?: boolean;
}


interface SResponse<T> {
  code: number;
  msg: string;
  data?: T
}

interface IndexResponse {
  status: string;
  error: string;
  summaries: any;
  subtitles: any;
  tier: string; //FREE,PRO
}

interface YoutubeKeyInsightResponse {
  status: string;
  error: string;
  tier: string; //FREE,PRO
  summary?: string
  keyInsights?: KeyInsightItem[]
}

interface KeyInsightItem {
  emoji: string,
  text: string
}


interface YoutubeCaptionEntity extends BaseEntity {
  videoId: string
  language: string
  taskStatus: string
  error?: string
  captions: YoutubeCaptionItem[]
}

interface YoutubeCaptionItem {
  startTime: number,
  endTime: number,
  text: string
}

interface YoutubeKeyInsightEntity extends BaseEntity {
  videoId: string
  language: string
  taskStatus: string
  error?: string
  summary?: string
  keyInsights?: YoutubeKeyInsightItem[]
}

interface YoutubeKeyInsightItem {
  emoji: string,
  text: string
}

interface SubtitleWithTimeStamp {
  startTime: number,
  text: string
}


interface VideoSubtitleEntity {
  id?: number,
  created?: number,
  updated?: number,
  videoId: number,
  language: string,
  srtPath: string,
}

interface VideoEntity {
  id?: number,
  created?: string,
  updated?: string,
  url?: string,
  source?: string, // youtube, local , podcast
  videoPath?: string,
  audioPath?: string,
  srtPath?: string,
  title?: string,
  author?: string,
  thumbnail?: string,
  channelId?: string,
  defaultLanguage?: string,
}

interface VideoVO {
  id?: number,
  url: videoEntity.url,
  source: videoEntity.source,
  videoPath: videoEntity.videoPath,
  audioPath: videoEntity.audioPath,
  srtPath: videoEntity.srtPath,
  title?: string,
  author?: string,
  channelId?: string,
  thumbnail?: string,
  subtitles?: Subtitle[],
  secondarySubtitles?: Subtitle[],
}

interface VideoSummaryEntity {
  id?: number,
  created?: number,
  updated?: number,
  videoId: number,
  language: string,
  summary: string,
  taskStatus: string,
  error: string,
}

interface VideoChannelEntity {
  id?: number,
  created?: number,
  updated?: number,
  channelId: string,
  channelName: string,
  channelAvatar: string,
}

interface VideoSummaryVo {
  summary?: string
  keyInsights?: KeyInsightItem[]
  taskStatus?: string
}

interface KeyInsightItem {
  emoji: string,
  text: string
}
