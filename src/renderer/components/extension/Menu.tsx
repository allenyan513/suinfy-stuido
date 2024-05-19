// import {Dropdown} from "antd";
// import {MoreOutlined} from "@ant-design/icons";
//
// const items = [
//   {
//     key: 'myPlan',
//     label: <span>My Plan</span>
//   },
//   {
//     key: 'signOut',
//     label: <span className='text-md'>Sign Out</span>
//   }
// ]
// if (process.env.NODE_ENV === 'development') {
//   items.push({
//     key: 'emailSignIn',
//     label: <span>xx</span>
//   })
// }
//
// export default function Menu() {
//
//   return (
//     <Dropdown
//       className='cursor-pointer'
//       trigger={['click','hover']}
//       menu={{
//         items: items,
//         onClick: ({key: key}) => {
//           console.log(key)
//           if (key === 'signOut') {
//             // signOut()
//           } else if (key === 'test') {
//             console.log('test')
//             parent.postMessage({type: 'seekTo', startTime: 20}, '*');
//           }
//         }
//       }}>
//       <MoreOutlined className='text-lg'/>
//     </Dropdown>
//
//   );
// }
