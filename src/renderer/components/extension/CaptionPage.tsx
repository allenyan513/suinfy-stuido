// import React, {useEffect, useState} from 'react';
// // import IndexAPI from "@/service/indexAPI";
// import {Button} from "antd";
// import {formatTimeStamp} from "../../utils";
// import {useGlobal} from "../../hooks/useGloble";
// import {TASK_STATUS, MIN_HEIGHT, MAX_HEIGHT} from "../../const";
// import {useQuery} from "@tanstack/react-query";
// import IndexAPI from "../../service/indexAPI";
//
// export interface CaptionPageProps {
//   videoId: string;
//   guideMode: string;
// }
//
// export default function CaptionPage(props: CaptionPageProps) {
//   const {videoId, guideMode} = props
//
//   const {
//     setContainerHeight,
//     setShouldExpand,
//     isShowCaption,
//     defaultLanguage,
//     secondaryLanguage,
//   } = useGlobal();
//   const [showSubscribeButton, setShowSubscribeButton] = useState<boolean>(false)
//
//   const isEnableFetching = () => {
//     if (!videoId || videoId === '') {
//       return false
//     }
//     return true
//   }
//
//   const {isPending, error, data} = useQuery({
//     retry: false,
//     enabled: isEnableFetching(),
//     queryKey: [`get_caption_${videoId}_${defaultLanguage}_${secondaryLanguage}_${guideMode}`],
//     queryFn: async () => {
//       const [
//         data1,
//         data2
//       ] = await Promise.all([
//         IndexAPI.getCaption(videoId, defaultLanguage, guideMode),
//         IndexAPI.getCaption(videoId, defaultLanguage, guideMode),
//       ])
//       if (data1.code !== 200 || data2.code !== 200) {
//         throw new Error(data1.msg)
//       }
//       if (data1.data.taskStatus === TASK_STATUS.PROCESSED ||
//         data2.data.taskStatus === TASK_STATUS.PROCESSED) {
//         return {
//           primaryData: data1.data,
//           secondaryData: data2.data
//         }
//       } else {
//         throw new Error('error')
//       }
//     }
//   })
//
//   const toggleCaption = (isShowCaption: boolean,
//                          primaryData: any,
//                          secondaryData: any) => {
//     if (!isShowCaption) {
//       parent.postMessage({
//         type: 'showCaption',
//         isShowCaption: false,
//       }, '*');
//     } else {
//       //start a thread to show caption
//       //merge primaryData and secondaryData's text
//       const mergeCaptions = []
//       if (primaryData && primaryData.captions) {
//         const length = primaryData.captions.length
//         for (let i = 0; i < length; i++) {
//           mergeCaptions.push({
//             startTime: primaryData.captions[i].startTime,
//             endTime: primaryData.captions[i].endTime,
//             primaryText: primaryData.captions[i].text || '',
//             secondaryText: secondaryData?.captions[i]?.text || '',
//           })
//         }
//         if (mergeCaptions.length === 0) {
//           console.error('mergeCaptions is empty')
//           return
//         }
//         parent.postMessage({
//           type: 'showCaption',
//           isShowCaption: true,
//           captions: mergeCaptions
//         }, '*');
//       } else {
//         // console.error('primaryData is null')
//       }
//     }
//   }
//
//
//   function onDataChanged() {
//     if (data?.primaryData?.captions != null || error) {
//       //计算高度 pageContainer 当前的高度
//       const pageContainer = document.getElementById('extension-container');
//       if (pageContainer) {
//         const react = pageContainer.getBoundingClientRect()
//         const height = react.height
//         if (height < MAX_HEIGHT) {
//           parent.postMessage({type: 'changeHeight', height: height}, '*');
//           setContainerHeight(height)
//           setShouldExpand(true)
//         } else {
//           parent.postMessage({type: 'changeHeight', height: MAX_HEIGHT}, '*');
//           setContainerHeight(MAX_HEIGHT)
//           setShouldExpand(true)
//         }
//       } else {
//         console.error('pageContainer is null')
//       }
//     } else {
//       parent.postMessage({type: 'changeHeight', height: MIN_HEIGHT}, '*');
//       setShouldExpand(false)
//       setContainerHeight(MIN_HEIGHT)
//     }
//   }
//
//   useEffect(() => {
//     onDataChanged();
//   }, [data?.primaryData?.captions, error])
//
//   useEffect(() => {
//     toggleCaption(isShowCaption, data?.primaryData, data?.secondaryData)
//   }, [isShowCaption, data?.primaryData, data?.secondaryData]);
//
//   if (error) {
//     return (
//       <div className='p-4'>
//         <p className='text-white mb-4'>{error.message}</p>
//       </div>
//     )
//   }
//
//   if (isPending) {
//     return (
//       <div className='p-4'>
//         <Button
//           className='w-full '
//           size={'large'}
//           type='primary'
//           loading={isPending}
//         >Loading</Button>
//       </div>
//     )
//   }
//
//   return (
//     <div className='flex flex-1 flex-col overflow-y-auto px-4 pb-4 gap-2'>
//       <ul>
//         {data?.primaryData?.captions?.map((item: any, index: number) => (
//           <li key={index} className='text-white mb-1 text-md flex flex-row'>
//             <span
//               onClick={() => {
//                 parent.postMessage({type: 'seekTo', startTime: item?.startTime}, '*')
//               }}
//               className='mr-2 text-blue-500 cursor-pointer'>{formatTimeStamp(item.startTime)}</span>
//             <div>
//               <p className=''>{item.text}</p>
//               <p className=''>{data?.secondaryData?.captions[index]?.text}</p>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
//
// }
