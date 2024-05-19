import youtubeService, {YoutubeService} from '../youtubeService';
import {google, youtube_v3} from 'googleapis'
import crypto from 'crypto'
import ytdl from "ytdl-core";
import fs from "fs";
import kvstoreService from "../kvstoreService";
import ResponseUtils from "../../utils/sresponse";
import {BIZ_ERROR} from "../../../common/const";
import {getSubtitles} from "./youtubeSubtitleScraper";
import videoService from "../videoService";
import moment from "moment";
import {WHISPER_MODELS} from "../../../common/const";


export default class YoutubeServiceImpl implements YoutubeService {
  oauth2Client = new google.auth.OAuth2(
    `${process.env.GOOGLE_OAUTH_CLIENT_ID}`,
    `${process.env.GOOGLE_OAUTH_CLIENT_SECRET}`,
    'http://localhost:3001/oauth2callback'
  );
  scopes = [
    'https://www.googleapis.com/auth/youtube.readonly'
  ];
  youtubeV3: youtube_v3.Youtube = null

  constructor() {
    const userCredential = kvstoreService.get('youtube.userCredential')
    if (userCredential) {
      this.oauth2Client.setCredentials(JSON.parse(userCredential))
    }
    this.youtubeV3 = google.youtube('v3')
  }


  getVideoIdFromUrl(url: string): string {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('v')
  }

  async getSubtitle(youtubeVideoId: string): Promise<any> {
    return await getSubtitles({videoID: youtubeVideoId});
  }

  getAuthorizationUrl(): string {
    console.log('getAuthorizationUrl')
    const state = crypto.randomBytes(32).toString('hex');
    // req.session.state = state;
    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = this.oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      /** Pass in the scopes array defined above.
       * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
      scope: this.scopes,
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true,
      // Include the state parameter to reduce the risk of CSRF attacks.
      state: state
    });
    return authorizationUrl;
  }

  async handleAuthCallback(code: string): Promise<void> {
    console.log('handleAuthCallback', code)
    const {tokens} = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    kvstoreService.set('youtube.userCredential', JSON.stringify(tokens))
  }

  async getFormats(url: string) {
    const info = await ytdl.getInfo(url, {})
    return info.formats
  }

  async download(url: string, output: string, filter: string, quality: string, onProgress: (chunkLength: number, downloadedBytes: number, totalBytes: number) => void
  ) {
    return new Promise<void>((resolve, reject) => {
      const video = ytdl(url, {
        filter: "videoandaudio",
        // quality: quality || 'highestvideo',
      });
      video.on('progress', (chunkLength, downloadedBytes, totalBytes) => {
        onProgress(chunkLength, downloadedBytes, totalBytes)
      });
      const stream = video.pipe(fs.createWriteStream(output));
      stream.on('error', (err) => {
        reject(err);
      });
      stream.on('finish', () => {
        resolve();
      });
    })

  }


  async fetchYouTubeMeta(videoId: string) {
    try {
      const result = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      const data = await result.json()
      const channelId = data.author_url.replace('https://www.youtube.com/@', '')
      let subtitleResult = null
      try {
        subtitleResult = await youtubeService.getSubtitle(videoId)
      } catch (e) {
        console.error(e)
      }
      return {
        videoId: videoId,
        title: data.title,
        authorName: data.author_name,
        authorUrl: data.author_url,
        channelId: channelId,
        thumbnailUrl: data.thumbnail_url,
        defaultLanguage: subtitleResult ? subtitleResult.lang : '',
        url: `https://www.youtube.com/watch?v=${videoId}`,
      } as YoutubeMeta
    } catch (e) {
      console.error(e)
      return null
    }
  }


  async getMySubscribers(pageToken: string): Promise<SResponse<any>> {
    try {
      if (!this.oauth2Client.credentials) {
        return ResponseUtils.errorWith(BIZ_ERROR.NO_CREDENTIALS)
      }
      const subscriptionsResponse = await this.youtubeV3.subscriptions.list({
        auth: this.oauth2Client,
        part: ['id', 'snippet', 'contentDetails'],
        mine: true,
        maxResults: 20,
        pageToken: pageToken
      })
      // console.log(subscriptionsResponse)
      if (subscriptionsResponse.status != 200) {
        return ResponseUtils.error(subscriptionsResponse.statusText)
      }
      return ResponseUtils.success(subscriptionsResponse.data)
    } catch (e) {
      console.error(e)
      return ResponseUtils.error(e)
    }
  }

  async getLatestVideos(channelId: string, pageToken: string): Promise<SResponse<any>> {
    try {
      const channelsResponse = await this.youtubeV3.channels.list({
        auth: this.oauth2Client,
        part: ['id', 'snippet', 'contentDetails'],
        id: [channelId],
        maxResults: 20,
        pageToken: pageToken
      })
      if (channelsResponse.status != 200) {
        return ResponseUtils.error(channelsResponse.statusText)
      }
      const channel = channelsResponse.data.items[0]
      if (!channel) {
        return ResponseUtils.error('No channel found')
      }
      const uploadsId = channel.contentDetails.relatedPlaylists.uploads
      if (!uploadsId) {
        return ResponseUtils.error('No uploads found')
      }
      const playlistItemsResponse = await this.youtubeV3.playlistItems.list({
        auth: this.oauth2Client,
        part: ['id', 'snippet', 'contentDetails'],
        playlistId: uploadsId,
        maxResults: 20
      })
      if (playlistItemsResponse.status != 200) {
        return ResponseUtils.error(playlistItemsResponse.statusText)
      }
      return ResponseUtils.success(playlistItemsResponse.data)
    } catch (e) {
      console.error(e)
      return ResponseUtils.error(e)
    }
  }

  async summaryByDate(date: string): Promise<SResponse<any>> {
    if (!this.oauth2Client.credentials) {
      return ResponseUtils.errorWith(BIZ_ERROR.NO_CREDENTIALS)
    }

    const response = await this.getMySubscribers(null)
    let nextPageToken = response.data.nextPageToken
    const channelIds = response.data.items.map((item: any) => item.snippet.resourceId.channelId)
    while (nextPageToken) {
      const response = await this.getMySubscribers(nextPageToken)
      nextPageToken = response.data.nextPageToken
      channelIds.push(...response.data.items.map((item: any) => item.snippet.resourceId.channelId))
    }
    console.log('channelIds:', channelIds, channelIds.length)

    // const todayVideoIds = []
    for (const channelId of channelIds) {
      const videoIds = []
      const response = await this.getLatestVideos(channelId, null)
      if (response.code !== 200) {
        console.error(response.msg)
        continue
      }
      let nextPageToken = response.data.nextPageToken
      let isToday = false
      for (const item of response.data.items) {
        const publishedAt = moment(item.snippet.publishedAt).toDate()
        const now = moment(date,'YYYYMMDD').toDate()
        console.log(publishedAt, now)
        if (publishedAt.getFullYear() === now.getFullYear() &&
          publishedAt.getMonth() === now.getMonth() &&
          publishedAt.getDate() === now.getDate()) {
          isToday = true
          videoIds.push(item.snippet.resourceId.videoId)
        } else {
          isToday = false
          break
        }
      }
      while (nextPageToken && isToday) {
        const response = await this.getLatestVideos(channelId, nextPageToken)
        if (response.code !== 200) {
          console.error(response.msg)
          break
        }
        nextPageToken = response.data.nextPageToken
        for (const item of response.data.items) {
          const publishedAt = new Date(item.snippet.publishedAt)
          const now = new Date()
          if (publishedAt.getFullYear() === now.getFullYear() && publishedAt.getMonth() === now.getMonth() && publishedAt.getDate() === now.getDate()) {
            videoIds.push(item.snippet.resourceId.videoId)
          } else {
            isToday = false
            break
          }
        }
      }

      console.log('channelId', channelId)
      console.log('videoIds:', videoIds, videoIds.length)

      //
      for (const videoId of videoIds) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
        const videoEntity = await videoService.prepare(youtubeUrl)
        const responseSummary = await videoService.getSummary(videoEntity.id)
        console.log('responseSummary:', responseSummary)
      }
    }
    // console.log('videoIds:', todayVideoIds, todayVideoIds.length)
    // for (const videoId of todayVideoIds) {
    //   const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    //   const videoEntity = await videoService.prepare(youtubeUrl)
    //   // const responseSummary = await videoService.startTask(null, {
    //   //   videoId: videoEntity.id,
    //   //   videoQuality: 'highestvideo',
    //   //   targetLanguage: videoEntity.defaultLanguage,
    //   //   model: WHISPER_MODELS.BASE.value,
    //   //   isSummary: true,
    //   //   isSyncTranslation: false,
    //   // })
    //   const responseSummary= await videoService.getSummary(videoEntity.id)
    //   console.log('responseSummary:', responseSummary)
    // }
    return ResponseUtils.success([])
  }
}

