import {useEffect, useState} from "react";
import {Progress} from "../ui/progress";

const StatusBar = () => {
  const [progress, setProgress] = useState<number>(100)
  const [text, setText] = useState<string>('Downloading')
  useEffect(() => {
    const handleProgress = (event: any, ...args: any[]) => {
      if (args && args.length > 0) {
        setText(args[0].text)
        setProgress(args[0].progress)
      }
    }
    window.electron.receive('onProgress', handleProgress)
  }, [])
  const isDone = progress === 100
  return (
    <div className="flex flex-row h-[30px] gap-2  px-2 justify-end items-center border-t-gray-600 border-t-[1px] py-1">
      {!isDone && (
        <div className="flex flex-row gap-2 justify-end items-center">
          <p className="text-sm">{text}:{progress}%</p>
          <Progress
            className="w-20 h-2"
            value={progress}/>
        </div>
      )}
    </div>
  )
}

export default StatusBar
