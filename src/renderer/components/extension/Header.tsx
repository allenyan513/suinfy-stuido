// import clsx from "clsx";
// import React from "react";
// import {convertCodeToDisplayName} from "../../const/languages";
// import {PiSubtitles} from "react-icons/pi";
//
// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface HeaderProps {
// }
//
// export default function Header(props: HeaderProps) {
//
//   const {
//     currentTab,
//     setCurrentTab,
//     defaultLanguage,
//     setDefaultLanguage,
//     secondaryLanguage,
//     setSecondaryLanguage,
//     handleCollapse,
//     isShowCaption,
//     handleShowCaption,
//     expand,
//   } = useGlobal()
//
//   const renderItems = () => {
//     switch (currentTab) {
//       case 'keyinsight':
//       case 'summary':
//         return (
//           <div className='flex flex-row items-center gap-3'>
//             <LanguageSelector
//               onClick={(lang) => {
//                 window.localStorage.setItem('defaultLanguage', lang)
//                 setDefaultLanguage(lang)
//               }}>
//               <span>{convertCodeToDisplayName(defaultLanguage)}</span>
//             </LanguageSelector>
//           </div>
//         )
//       case 'caption':
//         return (
//           <div className='flex flex-row items-center gap-3'>
//             {/*<Tooltip title='Caption' placement='right'>*/}
//             <span className={clsx('text-2xl mr-2 cursor-pointer', {
//               'border-b-red-500 border-b-[2px]': isShowCaption,
//               '': !isShowCaption
//             })} onClick={handleShowCaption}>
//                 <PiSubtitles/>
//               </span>
//             {/*</Tooltip>*/}
//             <div className='flex flex-row gap-1'>
//               <LanguageSelector
//                 onClick={(lang) => {
//                   window.localStorage.setItem('defaultLanguage', lang)
//                   setDefaultLanguage(lang)
//                 }}>
//                 {/*<Tooltip title='Default Language' placement='right'>*/}
//                 <span>{defaultLanguage.toUpperCase()}</span>
//                 {/*</Tooltip>*/}
//               </LanguageSelector>
//               <SwapOutlined className='text-xs'/>
//               <LanguageSelector
//                 onClick={(lang) => {
//                   window.localStorage.setItem('secondaryLanguage', lang)
//                   setSecondaryLanguage(lang)
//                 }}>
//                 {/*<Tooltip title='Secondary Language' placement='right'>*/}
//                 <span>{secondaryLanguage.toUpperCase()}</span>
//                 {/*</Tooltip>*/}
//               </LanguageSelector>
//             </div>
//           </div>
//         )
//       default:
//         return (
//           <Spin
//             spinning={true}
//             indicator={<LoadingOutlined className='text-base' spin/>}/>
//         )
//     }
//   }
//
//   return (
//     <div className='flex flex-row justify-between items-center h-16 px-4 bg-[#141414] rounded-2xl'>
//       <div className='flex flex-row bg-[#1f1f1f] rounded-2xl p-1'>
//         <a
//           onClick={() => {
//             window.localStorage.setItem('currentTab', 'keyinsight')
//             setCurrentTab('keyinsight')
//             expand()
//             // props.onChange?.('keyinsight')
//           }}
//           className={clsx('text-white text-xl px-4 py-2 rounded-xl cursor-pointer', {
//             'bg-[#333333]': currentTab === 'keyinsight',
//           })}>
//           <BsLightningCharge/>
//         </a>
//         <a
//           onClick={() => {
//             window.localStorage.setItem('currentTab', 'summary')
//             setCurrentTab('summary')
//             expand()
//             // props.onChange?.('summary')
//           }}
//           className={clsx('text-white text-xl px-4 py-2 rounded-xl cursor-pointer', {
//             'bg-[#333333]': currentTab === 'summary',
//           })}>
//           <BsListUl/>
//         </a>
//         <a
//           onClick={() => {
//             window.localStorage.setItem('currentTab', 'caption')
//             setCurrentTab('caption')
//             expand()
//             // props.onChange?.('caption')
//           }}
//           className={clsx('text-white text-xl px-4 py-2 rounded-xl cursor-pointer', {
//             'bg-[#333333]': currentTab === 'caption',
//           })}>
//           <BsBadgeCc/>
//         </a>
//       </div>
//       <div onClick={handleCollapse} className='flex-1 w-full mx-2 h-full cursor-pointer'></div>
//       {renderItems()}
//     </div>
//   )
// }
