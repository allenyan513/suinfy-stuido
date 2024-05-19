import {Link, useHistory} from 'react-router-dom'
import {useState, useEffect} from "react";
import {Button} from "../components/ui/button";
import {WHISPER_MODELS} from "../../common/const";
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
import {useGlobal} from "../hooks/useGloble";
import {Checkbox} from "./ui/checkbox";
import LanguageSelector from "./LanguageSelector";
import {Input} from "../components/ui/input";

interface SubtitleSettingDialogProps {
  open: boolean;
  onClosed: () => void;
}

function SubtitleSettingDialog(props: SubtitleSettingDialogProps) {
  const [model, setModel] = useState<string>(WHISPER_MODELS.TINY.value)
  const [videoEntity, setVideoEntity] = useState<VideoEntity>()

  const {
    showDefaultLanguage,
    showSecondaryLanguage,
    saveShowDefaultLanguage,
    saveShowSecondaryLanguage,
    secondaryLanguage,
    saveSecondaryLanguage
  } = useGlobal()

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
          <DialogTitle>字幕设置</DialogTitle>
        </DialogHeader>
        <div className="">
          <div className="flex flex-col w-full gap-2">
            {/*<div className="flex flex-row justify-between items-center">*/}
            {/*  <p>显示字幕</p>*/}
            {/*  <Checkbox*/}
            {/*    defaultChecked={isShowCaption}*/}
            {/*    onCheckedChange={(checked) => {*/}
            {/*      setIsShowCaption(checked)*/}
            {/*      window.localStorage.setItem('showCaption', checked ? 'true' : 'false')*/}
            {/*    }}/>*/}
            {/*</div>*/}
            <div className="flex flex-row justify-between items-center">
              <p>显示原始语言</p>
              <Checkbox
                defaultChecked={showDefaultLanguage}
                onCheckedChange={(checked) => {
                  saveShowDefaultLanguage(checked)
                }}/>
            </div>
            {/*<div className="flex flex-row justify-between items-center">*/}
            {/*  <p>字体大小</p>*/}
            {/*  <Input type="number"*/}
            {/*         className="w-[180px]"*/}
            {/*         defaultValue="20"/>*/}
            {/*</div>*/}
            {/*<div className="flex flex-row justify-between items-center">*/}
            {/*  <p>颜色</p>*/}
            {/*  <Input type="number"*/}
            {/*         className="w-[180px]"*/}
            {/*         defaultValue="20"/>*/}
            {/*</div>*/}
            <div className="flex flex-row justify-between items-center">
              <p>显示翻译语言</p>
              <Checkbox
                defaultChecked={showSecondaryLanguage}
                onCheckedChange={(checked) => {
                  saveShowSecondaryLanguage(checked)
                }}/>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p>翻译语言</p>
              <LanguageSelector
                onValueChange={(value: string) => {
                  saveSecondaryLanguage(value)
                }}
                defaultValue={secondaryLanguage}
                placeholder={secondaryLanguage}
              />
            </div>
            {/*<div className="flex flex-row justify-between items-center">*/}
            {/*  <p>字体大小</p>*/}
            {/*  <Input type="number"*/}
            {/*         className="w-[180px]"*/}
            {/*         defaultValue="20"/>*/}
            {/*</div>*/}
            {/*<div className="flex flex-row justify-between items-center">*/}
            {/*  <p>颜色</p>*/}
            {/*  <Input type="number"*/}
            {/*         className="w-[180px]"*/}
            {/*         defaultValue="20"/>*/}
            {/*</div>*/}
          </div>
          {/*<DialogFooter className="mt-8">*/}
          {/*  <Button */}
          {/*    onClick={}*/}
          {/*    variant='default'>取消</Button>*/}
          {/*  <Button variant='default'>确认</Button>*/}
          {/*</DialogFooter>*/}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubtitleSettingDialog
