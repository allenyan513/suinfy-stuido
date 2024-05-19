import {TASK_STATUS} from "../../common/const";
import {useState, useEffect} from "react";
import {Button} from "../components/ui/button";
import Markdown from 'react-markdown'
import LanguageSelector from "../components/LanguageSelector";
import {useGlobal} from "../hooks/useGloble";

interface SummaryComponentProps {
  youtubeVideoId: string
}

const SummaryComponent = (props: SummaryComponentProps) => {

  const [summary, setSummary] = useState<VideoSummaryVo>()
  const [isPending, setIsPending] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const {
    secondaryLanguage,
    setSecondaryLanguage,
  } = useGlobal()

  const fetchData = async () => {
    try {
      if (!props.youtubeVideoId || props.youtubeVideoId === '') {
        return
      }
      setIsPending(true)
      const youtubeUrl = `https://www.youtube.com/watch?v=${props.youtubeVideoId}`
      const videoEntity = await window.electron.invoke("prepare", youtubeUrl) as VideoEntity
      if (!videoEntity) {
        setError('Failed to prepare video')
        return
      }
      const response = await window.electron.invoke('getSummary', {
        videoId: videoEntity.id,
        language: 'en',
      }) as SResponse<VideoSummaryVo>
      if (response.code !== 200) {
        setError(response.msg)
        return
      }

      const translatedSummaryResponse = await window.electron.invoke('getTranslatedSummary', {
        videoId: videoEntity.id,
        defaultLanguage: 'en',
        targetLanguage: secondaryLanguage,
      }) as SResponse<VideoSummaryVo>
      console.log('response:', translatedSummaryResponse)
      if (translatedSummaryResponse.code !== 200) {
        setError(translatedSummaryResponse.msg)
        return
      }
      const taskStatus = translatedSummaryResponse.data?.taskStatus
      if (taskStatus === TASK_STATUS.PROCESSING) {
        console.log('re-query after 3 seconds')
      } else if (taskStatus === TASK_STATUS.ERROR) {
        console.log('error')
        setError(translatedSummaryResponse.msg)
      } else if (taskStatus === TASK_STATUS.PROCESSED) {
        setError(null)
        setSummary(translatedSummaryResponse.data)
        setIsPending(false)
      } else {
        setError('unknown status')
      }
    } catch (e) {
      console.error(e)
      setError('Failed to fetch summary')
    }
  }

  useEffect(() => {
    fetchData()
  }, [props.youtubeVideoId]);

  if (!props.youtubeVideoId) {
    return null
  }

  if (error) {
    return (
      <div>
        {error}
      </div>
    )
  }

  if (isPending) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  if (!summary) {
    return (
      <div>
        <Button onClick={fetchData}>Summary</Button>
      </div>
    )
  }

  return (
    <div
      className='flex flex-grow w-full h-full flex-col overflow-y-auto gap-2 rounded-md border-gray-700 border-[1px] p-2'>
      <div className="flex flex-row justify-between items-center">
        <span className="text-xl">Summary</span>
        <div className="flex flex-row items-center">
          <span>翻译:</span>
          <LanguageSelector
            onValueChange={(value: string) => {
              setSecondaryLanguage(value)
            }}
            defaultValue={secondaryLanguage}
            placeholder={secondaryLanguage}
          />
        </div>
      </div>
      <Markdown>
        {summary?.summary}
      </Markdown>
    </div>
  )

}

export default SummaryComponent;
