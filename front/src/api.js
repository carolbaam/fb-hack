import axios from 'axios';
import join from 'url-join';
import merge from 'lodash/merge';

// export default axios.create({
//   baseURL: process.env.REACT_APP_API,
// headers: {
//   authorization: localStorage.getItem('token'),
// },
// });

export default {
  get: (url, options) => axios.get(join(process.env.REACT_APP_API, url), merge(options, {
    headers: {
      authorization: localStorage.getItem('token'),
    },
  })),
  post: (url, body, options) => axios.post(join(process.env.REACT_APP_API, url),
    body, merge(options, {
      headers: {
        authorization: localStorage.getItem('token'),
      },
    })),
};
