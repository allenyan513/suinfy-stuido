// import {Dropdown, MenuProps, Tooltip} from "antd";
// import {SUPPORT_LANGUAGES} from "../../const/languages";
//
//
// const items: MenuProps['items'] =
//   SUPPORT_LANGUAGES.map((item) => ({
//     key: item.code,
//     label: (
//       <div className='flex flex-row gap-2'>
//         <span className='w-6 text-lg'>{item.displayCode}</span>
//         <span className='w-32 text-lg'>{item.displayName}</span>
//       </div>
//     ),
//   }));
//
// export interface LanguageSelectorProps {
//   onClick?: (language: string) => void;
//   children?: React.ReactNode;
// }
//
// export default function LanguageSelector(props: LanguageSelectorProps) {
//   return (
//     <Dropdown
//       className='cursor-pointer'
//       trigger={['click']}
//       overlayClassName='h-96 overflow-y-auto border border-gray-300 rounded-lg shadow-lg bg-opacity-90 bg-black'
//       menu={{
//         items,
//         onClick: ({key: key}) => {
//           props.onClick?.(key);
//         }
//       }}>
//       {props.children}
//     </Dropdown>
//   );
// }
