import React, {useEffect, useRef, useState} from 'react';
import {Loader2} from "lucide-react";
import {Button} from "../components/ui/button";
import SubtitleSettingDialog from "../components/SubtitleSettingDialog";
import {AiOutlineSetting} from "react-icons/ai";
import {formatSubtitleTimeStampShort} from "../utils";

interface TranscriptComponentProps {
  subtitles?: Subtitle[]
  secondarySubtitles?: Subtitle[]
}

const TranscriptComponent = (props: TranscriptComponentProps) => {
  const scrollViewRef = useRef(null);

  const [openSubtitleSetting, setOpenSubtitleSetting] = useState<boolean>(false)

  // useEffect(() => {
  //   //scroll to bottom
  //   if (scrollViewRef.current) {
  //     scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight
  //   }
  // }, [props.subtitles])

  return (
    <div
      ref={scrollViewRef}
      className='w-full h-full'>
      <div className="flex flex-row-reverse items-center">
        {/*<span className="text-xl">Transcript</span>*/}
        <AiOutlineSetting
          className='h-8 w-8 text-lg border-2 border-gray-800 rounded-md p-1 cursor-pointer hover:bg-gray-800 hover:text-white'
          onClick={() => {
            setOpenSubtitleSetting(true)
          }}
        />
      </div>
      {props.subtitles && props.subtitles.map((subtitle, index) => {
        return (
          <div key={index} className='flex flex-row gap-4 mb-2'>
            <div className='text-[#666666] text-sm mt-1'>{formatSubtitleTimeStampShort(subtitle.startTime)}</div>
            <div className="flex flex-col">
              <p> {subtitle.text} </p>
              <p> {props.secondarySubtitles[index]?.text} </p>
            </div>
          </div>
        )
      })}
      <SubtitleSettingDialog
        open={openSubtitleSetting}
        onClosed={() => {
          setOpenSubtitleSetting(false)
        }}/>
    </div>
  )
}
export default TranscriptComponent;
