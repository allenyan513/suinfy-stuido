import {Link} from 'react-router-dom'
import {useEffect, useState} from "react";
import {Button} from "../components/ui/button";
import PrepareDialog from "../components/PrepareDialog";
import {replaceFile} from "../utils";
import SearchBar from "../components/SearchBar";
import {useGlobal} from "../hooks/useGloble";

function MyVideoList() {
  const [videos, setVideos] = useState<VideoEntity[]>([])

  const{
    secondaryLanguage,
    model,
  } = useGlobal()

  useEffect(() => {
    window.electron.invoke('getList', 1, 12)
      .then((result: any) => {
        console.log(result)
        setVideos(result)
      }).catch((e: any) => {
      console.error(e)
    })
  }, []);
  return (
    <div className="grid grid-cols-3 gap-4">
      {videos && videos.map((video) => {
        return (
          <Link key={video.id} to={`/video/${video.id}?secondaryLanguage=${secondaryLanguage}&model=${model}`}>
            <div className="flex flex-col">
              <img
                className="rounded-md w-full object-cover aspect-video"
                src={replaceFile(video.thumbnail)}
                alt={video.title}/>
              <div>{video.title}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function HomePage() {
  return (
    <div id="root" className="flex flex-col w-full px-20 pt-20 gap-4 h-screen overflow-y-auto">
      <h1>欢迎使用Suinfy.</h1>
      <SearchBar />
      <MyVideoList/>
    </div>
  )
}

export default HomePage
