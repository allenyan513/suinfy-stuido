// import {Input} from "../components/ui/input";
import {GoHome, GoGear, GoVideo} from "react-icons/go";
import clsx from "clsx";
import {useHistory, useLocation} from "react-router-dom";


interface HomeTemplateProps {
  children: React.ReactNode
}

export default function HomeTemplate(props: HomeTemplateProps) {
  const location = useLocation()
  const path = location.pathname

  return (
    <div className="flex flex-row w-full h-[100vh] bg-white dark:bg-[#121212] dark:text-white">
      <header
        className="flex flex-col px-4 py-8 justify-start items-center border-r-[1px] border-gray-800">
        {/*<h1 className="text-3xl font-bold text-suinfyPrimary mb-4">Suinfy</h1>*/}
        <img src='./assets/icon-128.png' alt='' className='w-8 h-8 m-2'/>
        <nav>
          <ul className="flex flex-col justify-start gap-2 mt-4">
            <li>
              <a href="#/"
                 className={clsx('flex flex-row items-center rounded-md', {
                   'bg-[#333333]': path === '/',
                 })}>
                <GoHome className='w-6 h-6 m-2'/>
              </a>
            </li>
            {/*<li>*/}
            {/*  <a href="#/channel"*/}
            {/*     className={clsx('flex flex-row items-center rounded-md', {*/}
            {/*       'bg-[#333333]': path === '/channel',*/}
            {/*     })}>*/}
            {/*    <GoVideo className='w-6 h-6 m-2'/>*/}
            {/*  </a>*/}
            {/*</li>*/}
            <li>
              <a href="#/setting"
                 className={clsx('flex flex-row items-center rounded-md', {
                   'bg-[#333333]': path === '/setting',
                 })}>
                <GoGear className='w-6 h-6 m-2'/>
              </a>
            </li>
          </ul>
        </nav>
      </header>
      {props.children}
    </div>
  )
}
