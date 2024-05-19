// import React, {useEffect, useState} from 'react';
// import {Button} from "antd";
// import {useGlobal} from "../../hooks/useGloble";
// import {TASK_STATUS, MIN_HEIGHT, MAX_HEIGHT} from "../../const";
// import {useQuery, useQueryClient} from "@tanstack/react-query";
// import IndexAPI from "../../service/indexAPI";
//
// export interface KeyInsightPageProps {
//   videoId: string;
//   guideMode: string;
// }
//
// export default function KeyInsightPage(props: KeyInsightPageProps) {
//   const {videoId, guideMode} = props
//   const {
//     setContainerHeight,
//     setShouldExpand,
//     defaultLanguage,
//     currentTab,
//   } = useGlobal();
//   const [showSubscribeButton, setShowSubscribeButton] = useState<boolean>(false)
//   const queryClient = useQueryClient()
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
//     queryKey: [`generate_key_insight_${videoId}_${defaultLanguage}_${guideMode}`],
//     queryFn: async () => {
//       // setIsLoading(true)
//       const data = await IndexAPI.generateKeyInsight(videoId, defaultLanguage, guideMode)
//       if (data.code !== 200) {
//         throw new Error(data.msg)
//       }
//       switch (data.data.status) {
//         case TASK_STATUS.PROCESSED:
//           // setIsLoading(false)
//           return {status: TASK_STATUS.PROCESSED, data: data.data}
//         case TASK_STATUS.PROCESSING:
//           //re-query after 3 seconds
//           setTimeout(() => {
//             queryClient.refetchQueries({
//               queryKey: [`generate_key_insight_${videoId}_${defaultLanguage}_${guideMode}`]
//             })
//           }, 3 * 1000);
//           return {status: TASK_STATUS.PROCESSING}
//         case TASK_STATUS.ERROR:
//           // setIsLoading(false)
//           throw new Error(data.data.error)
//         case TASK_STATUS.NO_ACCESS:
//           // setIsLoading(false)
//           throw new Error('Free trial has expired, please subscribe')
//         default:
//           // setIsLoading(false)
//           throw new Error('unknown status')
//       }
//     }
//   })
//
//
//   function onDataChanged() {
//     if (data?.data?.keyInsights != null || error) {
//       //计算高度 pageContainer 当前的高度
//       const pageContainer = document.getElementById('extension-container');
//       if (pageContainer) {
//         const react = pageContainer.getBoundingClientRect()
//         const height = react.height
//         console.error('height', height)
//         if (height < MAX_HEIGHT) {
//           parent.postMessage({type: 'changeHeight', height: height}, '*');
//           setContainerHeight(height)
//         } else {
//           parent.postMessage({type: 'changeHeight', height: MAX_HEIGHT}, '*');
//           setContainerHeight(MAX_HEIGHT)
//         }
//         setShouldExpand(true)
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
//   }, [currentTab, data, error]);
//
//   if (error) {
//     return (
//       <div className='p-4'>
//         <p className='text-white mb-4'>{error.message}</p>
//       </div>
//     )
//   }
//
//   if (isPending || data?.status === TASK_STATUS.PROCESSING) {
//     return (
//       <div className='p-4'>
//         <Button
//           className='w-full '
//           size={'large'}
//           type='primary'
//           loading={isPending || data?.status === TASK_STATUS.PROCESSING}
//         >Summarizing</Button>
//       </div>
//     )
//   }
//
//   return (
//     <div
//       id='page-container'
//       className='flex flex-1 flex-col overflow-y-auto px-4 pb-4 gap-2'>
//       <span>{data?.data?.summary}</span>
//       <ul>
//         {data?.data?.keyInsights?.map((item: any, index: number) => (
//           <li key={index} className='text-white mb-1 text-md flex flex-row'>
//             <span className='mr-2'>{item.emoji}</span>
//             <span>{item.text}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
//
// }
