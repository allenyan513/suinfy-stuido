import {Button} from "./ui/button";
import {useState, useEffect} from "react";
import PrepareDialog from "./PrepareDialog";
import {GoSearch} from "react-icons/go";


const SearchBar = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [open, setOpen] = useState(false);
  const handleInput = async (e: any) => {
    if (e.key == 'Enter' && inputValue) {
      e.preventDefault()
      setOpen(true)
    }
  }

  // const handleOpenFile = async () => {
  //   try {
  //     const result = await window.electron.invoke('openDialog', {})
  //     console.log(result)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }
  //
  // useEffect(() => {
  //   window.electron.receive('selectedFiles', (event: any, files: any) => {
  //     console.log('selectedFiles:', files)
  //     if (files && files.length > 0) {
  //       setInputValue("file://" + files[0])
  //       setOpen(true)
  //     }
  //   })
  // }, []);


  return (
    <div className="flex flex-row w-full">
      <div
        className="flex flex-row items-center justify-start w-full h-16 border-[1px] rounded-md px-4 py-2 gap-4 text-white bg-[#333333] border-[#666666] focus:border-[#666666] focus:outline-none">
        <GoSearch/>
        <input
          className="w-full text-white bg-[#333333] focus:outline-none"
          type="text"
          value={inputValue}
          onKeyDown={handleInput}
          placeholder={"请输入YouTube视频链接"}
          onChange={(e) => {
            setInputValue(e.target.value)
          }}/>
      </div>
      <PrepareDialog
        open={open}
        url={inputValue}
        onClosed={() => setOpen(false)}
      />
    </div>
  )
}

export default SearchBar
