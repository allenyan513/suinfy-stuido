// import React from "react";
// import Header from "./Header";
// import KeyInsightPage from "./KeyInsightPage";
// import CaptionPage from "./CaptionPage";
//
// export interface ExtensionContainerProps {
//   videoId: string
//   guideMode: string
// }
//
// export default function ExtensionContainer(props: ExtensionContainerProps) {
//   const {
//     videoId,
//     guideMode,
//   } = props
//
//   const renderPage = () => {
//     switch (currentTab) {
//       case 'keyinsight':
//         return (
//           <KeyInsightPage
//             videoId={videoId}
//             guideMode={guideMode}
//           />
//         )
//       case 'caption':
//         return (
//           <CaptionPage
//             videoId={videoId}
//             guideMode={guideMode}
//           />
//         )
//       default:
//         return null
//     }
//   }
//
//
//   return (
//     <div
//       id='extension-container'
//       className='w-full flex flex-col justify-stretch border-[1px] border-gray-500 rounded-2xl bg-[#141414]'>
//       <Header/>
//       {renderPage()}
//     </div>
//   );
// }
