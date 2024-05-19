import dotenv from 'dotenv';
// if (process.env.NODE_ENV === 'development') {
//   dotenv.config({path: '.env.development'});
// } else {
//   dotenv.config({path: '.env'});
// }
dotenv.config({path: '.env'});
console.log(process.env.NODE_ENV);
console.log('OPEN_AI_API_KEY', process.env.OPEN_AI_API_KEY);
// console.log(process.env);
