import {Loader2} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import {useEffect, useState} from "react";
import {useGlobal} from "../../hooks/useGloble";


interface VideoPlayerComponentProps {
  videoPath: string
  thumbnail: string
  title: string
  author: string
  primarySubtitles?: Subtitle[]
  secondarySubtitles?: Subtitle[]
}

const VideoPlayerComponent = (props: VideoPlayerComponentProps) => {

  const isVideoPathEmpty = props.videoPath === '' || props.videoPath == null
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState<number>(-1)
  const [primaryCaption, setPrimaryCaption] = useState<string>('')
  const [secondaryCaption, setSecondaryCaption] = useState<string>('')


  const {
    showDefaultLanguage,
    showSecondaryLanguage
  } = useGlobal()

  function handleProgress(currentTime: number) {
    if (currentCaptionIndex !== -1) {
      const sub = props.primarySubtitles[currentCaptionIndex];
      if (currentTime >= sub.startSeconds && currentTime <= sub.endSeconds) {
        // 当前时间还在当前字幕的时间范围内
        // console.log('当前时间还在当前字幕的时间范围内');
        return;
      }
    }
    const newSubtitleIndex = props.primarySubtitles.findIndex(sub => currentTime >= sub.startSeconds && currentTime <= sub.endSeconds);
    if (newSubtitleIndex !== -1) {
      setPrimaryCaption(props.primarySubtitles[newSubtitleIndex].text)
      setSecondaryCaption(props.secondarySubtitles[newSubtitleIndex]?.text)
      setCurrentCaptionIndex(newSubtitleIndex)
    } else {
      setPrimaryCaption('')
      setSecondaryCaption('')
    }
  }

  return (
    <div className="flex flex-col w-full rounded-md">
      <div className="relative w-full max-h-screen aspect-video rounded-md">
        {isVideoPathEmpty && (
          <div className="relative w-full aspect-video">
            <img src={props.thumbnail} alt={props.title} className="rounded-md w-full object-cover aspect-video"/>
            <Loader2
              className="absolute top-1/2 left-1/2 h-10 w-10 animate-spin"/>
          </div>
        )}
        {!isVideoPathEmpty && (
          <VideoPlayer
            videoSrc={"media://" + props.videoPath}
            playing={true}
            onProgress={handleProgress}
          />
        )}
        <div className="absolute left-0 bottom-4 w-full flex flex-col justify-center items-center pointer-events-none ">
          <div className="flex flex-col justify-center items-center w-auto max-w-[90%] p-2 rounded-md ">
            {showSecondaryLanguage && (
              <p className="secondaryCaption">{secondaryCaption}</p>
            )}
            {showDefaultLanguage && (
              <p className="primaryCaption">{primaryCaption}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default VideoPlayerComponent
