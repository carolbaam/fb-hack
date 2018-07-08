import axios from 'axios';

console.log('process.env.REACT_APP_API', process.env.REACT_APP_API);

export default axios.create({
  baseURL: process.env.REACT_APP_API,
  headers: {
    authorization: localStorage.getItem('token'),
  },
});
