import {Dialog, DialogContent} from "../../components/ui/dialog";
import {Button} from "../../components/ui/button";
import {useState} from "react";


interface ExportDialogProps {
  videoId: string,
  open: boolean;
  onClose: () => void;
}

const ExportDialog = (props: ExportDialogProps) => {
  const [format, setFormat] = useState<string>("srt")
  const [language, setLanguage] = useState<string>("en")
  const [embed, setEmbed] = useState<boolean>(false)
  const handleExport = async () => {
    try {
      const response = await window.electron.invoke("export", {
        videoId: props.videoId,
        output:  "/Users/alin/Downloads/" + `${props.videoId}.mp4`,
        format: format,
        language: language,
        embed: embed
      }) as SResponse<string>
      if (response.code !== 200) {
        console.error(response.msg)
        return
      }
      console.log('export success', response.data)
      props.onClose
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose()
        }
      }}
    >
      <DialogContent>
        <div className="">
          <div>导出字幕/视频</div>
          <div>导出格式</div>
          <div>字幕语言</div>
          <div>是否内嵌字幕</div>
          <div>
            <Button variant='default'> 取消</Button>
            <Button variant='default'
                    onClick={handleExport}
            > 开始导出</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}

export default ExportDialog;
