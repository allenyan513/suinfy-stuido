import {useLocation, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import ExportDialog from "../components/video/ExportDialog";
import StatusBar from "../components/video/StatusBar";
import VideoPlayerContainer from "../components/video/VideoPlayerContainer";
import TranscriptComponent from "./TranscriptComponent";
import {Button} from "../components/ui/button";
import SearchBar from "../components/SearchBar";
import {Loader2} from "lucide-react";
import SubtitleSettingDialog from "../components/SubtitleSettingDialog";
import {useGlobal} from "../hooks/useGloble";
import SummaryComponent from "./SummaryComponent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {AiOutlineExport, AiOutlineTranslation} from "react-icons/ai";
import {HiOutlineRefresh} from "react-icons/hi";


const VideoPage = () => {
  // /video/:videoId  get videoId from url using react-router-dom
  const {
    videoId
  } = useParams<{ videoId: string }>()
  const {search} = useLocation()
  const searchParams = new URLSearchParams(search)
  const model = searchParams.get('model')
  const secondaryLanguage = searchParams.get('secondaryLanguage')

  const [url, setUrl] = useState<string>()
  const [source, setSource] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [channelId, setChannelId] = useState<string>('')
  const [thumbnail, setThumbnail] = useState<string>('')
  const [videoPath, setVideoPath] = useState<string>('')

  const [isPending, setIsPending] = useState<boolean>(true)
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false)
  const [isFetched, setIsFetched] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const [openExport, setOpenExport] = useState<boolean>(false)
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [secondarySubtitles, setSecondarySubtitles] = useState<Subtitle[]>([])
  const [openSubtitleSetting, setOpenSubtitleSetting] = useState<boolean>(false)

  const parseYoutubeVideoId = (url: string) => {
    return new URL(url).searchParams.get('v')
  }

  const startTask = async () => {
    try {
      const taskOptions: TaskOptions = {
        videoId: Number(videoId),
        videoQuality: 'highestvideo',
        targetLanguage: secondaryLanguage,
        isSummary: false,
        isSyncTranslation: true,
        model: model,
      }
      setIsTranscribing(true)
      await window.electron.invoke('startTask', taskOptions)
      setIsTranscribing(false)
    } catch (e) {
      console.error(e)
      setIsTranscribing(false)
    }
  }
  const fetchData = async () => {
    try {
      setIsPending(true)
      const response = await window.electron.invoke('getVideo', videoId) as SResponse<VideoVO>
      if (response.code !== 200) {
        setError(response.msg)
        setIsPending(false)
        return
      }
      const videoVo = response.data
      if (!videoVo) {
        setError('视频不存在')
        setIsPending(false)
        return
      }
      console.log('videoVo', videoVo)
      setUrl(videoVo.url)
      setSource(videoVo.source)
      setTitle(videoVo.title)
      setAuthor(videoVo.author)
      setChannelId(videoVo.channelId)
      setThumbnail(videoVo.thumbnail)
      setSubtitles(videoVo.subtitles)
      setSecondarySubtitles(videoVo.secondarySubtitles)
      // if (videoVo.videoPath === '' || videoVo.videoPath == null) {
      //   const taskOptions: TaskOptions = {
      //     videoId: Number(videoId),
      //     videoQuality: 'highestvideo',
      //     targetLanguage: secondaryLanguage,
      //     isSummary: true,
      //     isSyncTranslation: true,
      //     model: model,
      //   }
      //   setIsTranscribing(true)
      //   await window.electron.invoke('startTask', taskOptions)
      //   setIsTranscribing(false)
      // } else {
      //   setVideoPath(videoVo.videoPath)
      // }
      setVideoPath(videoVo.videoPath)
      setIsFetched(true)
      setIsPending(false)
    } catch (e) {
      console.error(e)
      setIsPending(false)
      setError(e.message)
    }
  }

  useEffect(() => {
    fetchData()
    const handleReceiveSubtitle = (event: any, ...args: any[]) => {
      if (args && args.length > 0) {
        if (args[0].videoId == videoId) {
          //避免其他页面的数据干扰
          setSubtitles((prev) => {
            return [...prev, args[0].subtitle]
          })
        }
      }
    }
    const handleReceiveSecondarySubtitle = (event: any, ...args: any[]) => {
      if (args && args.length > 0) {
        if (args[0].videoId == videoId) {
          setSecondarySubtitles((prev) => {
            return [...prev, args[0].subtitle]
          })
        }
      }
    }
    const handleReceiveVideoPath = (event: any, ...args: any[]) => {
      if (args && args.length > 0) {
        setVideoPath(args[0])
        setIsPending(false)
      }
    }
    window.electron.receive('onReceiveSubtitle', handleReceiveSubtitle)
    window.electron.receive('onReceiveSecondarySubtitle', handleReceiveSecondarySubtitle)
    window.electron.receive('onReceiveVideoPath', handleReceiveVideoPath)
  }, [])

  useEffect(() => {
    if (isFetched && (videoPath === '' || videoPath == null)) {
      // 服务端没有视频文件, 开始自动开始处理视频
      startTask()
    }
  }, [isFetched, videoPath]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-row justify-center items-center text-center">
        <div className='flex flex-col'>
          <span>{error}</span>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="w-full h-full flex flex-row justify-center items-center text-center">
        <Loader2 className="mr-2 h-4 w-4 inline animate-spin"/> Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-screen">
      {/*toolbar*/}
      <div className="flex flex-row h-[54px] gap-2 px-4 py-2 justify-end items-center border-gray-800 border-b-[1px] webkitAppRegionDrag">
        <Button
          disabled={isTranscribing}
          size={'xs'}
          className="gap-2"
          onClick={() => {
            console.log('transcribing')
          }}
          variant="default">
          {isTranscribing && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
          <HiOutlineRefresh/>
          ReTranscribe
        </Button>
        <Button
          size={'xs'}
          className="gap-2"
          onClick={() => {
            setOpenSubtitleSetting(true)
          }}
          variant="default">
          <AiOutlineTranslation/>
          Translate
        </Button>

        <Button
          // onClick={() => onClickTranslate()}
          size={'xs'}
          className="gap-2"
          variant="default">
          <AiOutlineExport/>
          Export
        </Button>
      </div>
      <div
        style={{
          height: 'calc(100vh - 54px)'
        }}
        className="flex flex-row w-full  gap-4 pt-4 px-4">
        <div className="flex flex-col w-1/2 overflow-y-auto">
          {/*<SearchBar/>*/}
          <VideoPlayerContainer
            videoPath={videoPath}
            thumbnail={thumbnail}
            title={title}
            author={author}
            primarySubtitles={subtitles}
            secondarySubtitles={secondarySubtitles}
          />
          <div className="flex flex-col py-4 gap-2">
            <div className="w-full">
              <span className="text-xl line-clamp-1">{author} - {title}</span>
            </div>
            <Tabs defaultValue="summary" className="dark w-full h-screen">
              <div className="flex flex-row w-full justify-between">
                <TabsList className="flex flex-row">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="timestamp">Timestamp</TabsTrigger>
                  {/*<TabsTrigger value="transcript">Transcript</TabsTrigger>*/}
                </TabsList>
                <div className="flex flex-row">
                </div>
              </div>
              <TabsContent value="summary">
                <div className="w-full h-full">
                  <SummaryComponent youtubeVideoId={parseYoutubeVideoId(url)}/>
                </div>
              </TabsContent>
              <TabsContent value="timestamp">
              </TabsContent>
              {/*<TabsContent value="transcript">*/}
              {/*  <div className='w-full h-full'>*/}
              {/*    <TranscriptComponent subtitles={subtitles} secondarySubtitles={secondarySubtitles}/>*/}
              {/*  </div>*/}
              {/*</TabsContent>*/}
            </Tabs>
            {/*<SummaryComponent youtubeVideoId={Number(videoId)}/>*/}
          </div>
        </div>
        <div className="flex flex-col w-1/2 h-full justify-start items-center overflow-y-auto rounded-md border-gray-700 border-[1px] p-2 mb-2">
          <TranscriptComponent subtitles={subtitles} secondarySubtitles={secondarySubtitles}/>
        </div>
      </div>
      {/*statusbar*/}
      {/*<StatusBar/>*/}
      <ExportDialog
        videoId={videoId}
        open={openExport}
        onClose={() => {
          setOpenExport(false)
        }}/>
      <SubtitleSettingDialog
        open={openSubtitleSetting}
        onClosed={() => {
          setOpenSubtitleSetting(false)
        }}/>
    </div>
  )
}

export default VideoPage
