import {useEffect, useState} from "react";
import {Button} from "../components/ui/button";
import ChannelPage from "./ChannelPage";
import {BIZ_ERROR} from "../../common/const";
import clsx from "clsx";


function ChannelListPage() {
  const [currentChannelId, setCurrentChannelId] = useState<string>()
  const [items, setItems] = useState<any[]>()
  const [pageToken, setPageToken] = useState<string>()

  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(true)

  const handleSummaryTodayNews = async () => {
    const response = await window.electron.invoke('summaryByDate','20240516') as SResponse<any>
    console.log('response:', response)
  }

  const fetchData = async () => {
    setIsPending(true)
    const channelResponse = await window.electron.invoke('getChannels', pageToken) as SResponse<any>
    console.log('channelResponse:', channelResponse)
    if (channelResponse.code !== 200) {
      setIsPending(false)
      setError(channelResponse.msg)
      if (channelResponse.code === BIZ_ERROR.NO_CREDENTIALS.code) {
        setShowAuthDialog(true)
        return
      }
      return
    }
    setItems(channelResponse.data.items)
    setPageToken(channelResponse.data.nextPageToken)
    setCurrentChannelId(channelResponse.data.items[0].snippet.resourceId.channelId)
    setIsPending(false)
  }

  useEffect(() => {
    fetchData()
  }, []);

  if (error) {
    return (
      <div>
        <span>{error}</span>
        <Button onClick={() => setShowAuthDialog(true)}>Authorize</Button>
      </div>
    )
  }
  if (isPending) {
    return (
      <div>
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col p-4 border-r-[1px] border-gray-800 h-full overflow-y-auto">
        <div
          key={'today news'}
          className={clsx("flex flex-row justify-between items-center cursor-pointer gap-2 p-2 rounded-md", {
            'bg-[#333333]': currentChannelId ==='today news'
          })}
          onClick={handleSummaryTodayNews}>
          <img
            className='rounded-full w-8 h-8'
            // src={item.snippet.thumbnails.default.url}
            alt=""/>
          <span
            className='text-base line-clamp-1 w-40'
          >Today News</span>
        </div>
        {items && items.map((item, index) => {
          return (
            <div
              key={item.snippet.resourceId.channelId}
              className={clsx("flex flex-row justify-between items-center cursor-pointer gap-2 p-2 rounded-md", {
                'bg-[#333333]': currentChannelId === item.snippet.resourceId.channelId
              })}
              onClick={() => {
                setCurrentChannelId(item.snippet.resourceId.channelId)
              }}>
              <img
                className='rounded-full w-8 h-8'
                src={item.snippet.thumbnails.default.url} alt=""/>
              <span
                className='text-base line-clamp-1 w-40'
              >{item.snippet.title}</span>
            </div>
          )
        })}
      </div>
      <ChannelPage channelId={currentChannelId}/>
    </div>
  )
}

export default ChannelListPage
