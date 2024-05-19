import {useEffect, useState} from "react";
import PrepareDialog from "../components/PrepareDialog";
import SummaryComponent from "./SummaryComponent";
import {Button} from "../components/ui/button";
import moment from "moment";
import clsx from "clsx";
import {GoArrowRight} from "react-icons/go";

interface VideoItemProps {
  item: any
  isSelected: boolean
  onClickVideo: () => void
  onClickSummary: () => void
}

function VideoItem(props: VideoItemProps) {
  return (
    <div className={clsx('flex flex-col w-full p-4 rounded-md cursor-pointer hover:bg-[#333333]', {
      'bg-[#333333]': props.isSelected
    })}>
      <img
        onClick={props.onClickVideo}
        className='aspect-video object-cover w-96 rounded-md mb-2'
        src={props.item.snippet.thumbnails.high.url} alt=""/>
      <div className='flex flex-col' onClick={props.onClickSummary}>
        <span>{props.item.snippet.title}</span>
        <div className='flex flex-row justify-between items-center'>
        <span
          className='text-sm text-gray-500'>{moment(props.item.snippet.publishedAt).format('yyyy-MM-DD HH:mm:ss')}</span>
          <span>Summary <GoArrowRight className='inline'/></span>
        </div>
      </div>
    </div>
  )
}


interface ChannelPageProps {
  channelId: string
}

function ChannelPage(props: ChannelPageProps) {
  // const history = useHistory()
  const [open, setOpen] = useState<boolean>(false)
  const [url, setUrl] = useState<string>('')
  const [items, setItems] = useState<any[]>()
  const [pageToken, setPageToken] = useState<string>()
  const [currentVideoId, setCurrentVideoId] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      if (!props.channelId) {
        return
      }
      console.log('props.channelId:', props.channelId)
      const videosResponse = await window.electron.invoke('getChannelVideos', props.channelId, pageToken)
      console.log('videosResponse:', videosResponse)
      if (videosResponse.code !== 200) {
        console.error(videosResponse.msg)
        return
      }
      setItems(videosResponse.data.items)
      setPageToken(videosResponse.data.nextPageToken)
    }
    fetchData()
  }, [props.channelId]);

  if (!props.channelId) {
    return null
  }

  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-96 min-w-96 p-4 h-screen overflow-y-auto gap-2 border-r-[1px] border-gray-800 ">
        {items && items.map((item, index) => {
          return (
            <VideoItem
              key={index}
              item={item}
              isSelected={currentVideoId === item.snippet.resourceId.videoId}
              onClickSummary={() => {
                setCurrentVideoId(item.snippet.resourceId.videoId)
              }}
              onClickVideo={()=>{
                setUrl(`https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`)
                setOpen(true)
              }}
            />
          )
        })}
      </div>
      {/*<div className="flex flex-col w-full h-full">*/}
      {/*  <div className="flex flex-row w-full">*/}
      {/*    <Button onClick={() => {*/}
      {/*      setOpen(true)*/}
      {/*      setUrl(`https://www.youtube.com/watch?v=${currentVideoId}`)*/}
      {/*    }}>*/}
      {/*      查看*/}
      {/*    </Button>*/}
      {/*    <Button onClick={() => {*/}
      {/*      setOpen(true)*/}
      {/*      setUrl(`https://www.youtube.com/watch?v=${currentVideoId}`)*/}
      {/*    }}>*/}
      {/*      设置*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*  <SummaryComponent youtubeVideoId={currentVideoId}/>*/}
      {/*</div>*/}
      <SummaryComponent youtubeVideoId={currentVideoId}/>
      <PrepareDialog
        open={open}
        url={url}
        onClosed={() => setOpen(false)}
      />
    </div>
  )
}

export default ChannelPage
