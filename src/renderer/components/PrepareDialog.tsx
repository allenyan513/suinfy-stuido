import {Link, useHistory} from 'react-router-dom'
import {useState, useEffect} from "react";
import {Button} from "../components/ui/button";
import {convertValueToName, WHISPER_MODELS} from "../../common/const";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {Loader2} from "lucide-react";
import {replaceFile} from "../utils";
import LanguageSelector from "../components/LanguageSelector";
import {useGlobal} from "../hooks/useGloble";
import {convertCodeToName} from "../../common/const/languages";

interface PrepareDialogProps {
  open: boolean;
  url: string;
  onClosed: () => void;
}

function PrepareDialog(props: PrepareDialogProps) {
  const history = useHistory();
  const [isPending, setIsPending] = useState<boolean>(true)
  const [videoEntity, setVideoEntity] = useState<VideoEntity>()
  console.log('PrepareDialog props:', props)
  const {
    secondaryLanguage,
    setSecondaryLanguage,
    saveSecondaryLanguage,
    model,
    saveModel,
  } = useGlobal()

  const fetchData = async () => {
    const result = await window.electron.invoke("prepare", props.url) as VideoEntity
    console.log(result)
    setIsPending(false)
    setVideoEntity(result)
  }

  useEffect(() => {
    if (!props.open) {
      return
    }
    fetchData()
  }, [props.open, props.url]);


  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClosed()
        }
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>选择视频</DialogTitle>
        </DialogHeader>
        <div className="">
          {isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
          )}
          {!isPending && videoEntity && (
            <div className="flex flex-col w-full gap-2">
              <img
                src={replaceFile(videoEntity.thumbnail)}
                alt={videoEntity.title}
                className="rounded-md w-full object-cover aspect-video"/>
              <div className="text-sm font-bold">{videoEntity.title}</div>
              <div className="flex flex-row justify-between items-center">
                <p>模型选择</p>
                <Select onValueChange={(value) => {
                  saveModel(value)
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      defaultValue={model}
                      placeholder={convertValueToName(model)}/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/*<SelectLabel>模型</SelectLabel>*/}
                      <SelectItem value={WHISPER_MODELS.TINY.value}>{WHISPER_MODELS.TINY.name}</SelectItem>
                      <SelectItem value={WHISPER_MODELS.BASE.value}>{WHISPER_MODELS.BASE.name}</SelectItem>
                      <SelectItem value={WHISPER_MODELS.SMALL.value}>{WHISPER_MODELS.SMALL.name}</SelectItem>
                      <SelectItem value={WHISPER_MODELS.MEDIUM.value}>{WHISPER_MODELS.MEDIUM.name}</SelectItem>
                      <SelectItem value={WHISPER_MODELS.LARGE_V1.value}>{WHISPER_MODELS.LARGE_V1.name}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p>字幕翻译</p>
                <LanguageSelector
                  onValueChange={(value: string) => {
                    setSecondaryLanguage(value)
                    saveSecondaryLanguage(value)
                  }}
                  placeholder={convertCodeToName(secondaryLanguage)}
                  defaultValue={secondaryLanguage}
                />
                {/*<Select>*/}
                {/*  <SelectTrigger className="w-[180px]">*/}
                {/*    <SelectValue placeholder="Select a fruit"/>*/}
                {/*  </SelectTrigger>*/}
                {/*  <SelectContent>*/}
                {/*    <SelectGroup>*/}
                {/*      <SelectLabel>Fruits</SelectLabel>*/}
                {/*      <SelectItem value="zh-cn">中文</SelectItem>*/}
                {/*    </SelectGroup>*/}
                {/*  </SelectContent>*/}
                {/*</Select>*/}
              </div>

              {/*<div className="flex flex-row justify-between items-center">*/}
              {/*  <p>总结</p>*/}
              {/*  <Select>*/}
              {/*    <SelectTrigger className="w-[180px]">*/}
              {/*      <SelectValue placeholder="Select a fruit"/>*/}
              {/*    </SelectTrigger>*/}
              {/*    <SelectContent>*/}
              {/*      <SelectGroup>*/}
              {/*        <SelectLabel>Fruits</SelectLabel>*/}
              {/*        <SelectItem value="yes">是</SelectItem>*/}
              {/*        <SelectItem value="no">否</SelectItem>*/}
              {/*      </SelectGroup>*/}
              {/*    </SelectContent>*/}
              {/*  </Select>*/}
              {/*</div>*/}
            </div>
          )}

          <DialogFooter className="mt-8">
            <Button
              variant='default'
              onClick={() => {
                props.onClosed()
              }}>取消</Button>
            <Button
              variant='default'
              onClick={() => {
                history.push(`/video/${videoEntity.id}?secondaryLanguage=${secondaryLanguage}&model=${model}`)
              }}>确定</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PrepareDialog
