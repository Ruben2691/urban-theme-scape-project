
import Cookies from 'js-cookie';


export const csrfFetch = async (url, options = {}) => {
  // set options.method to 'GET' if there is no method
  options.method = options.method || 'GET';
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};

  // ...
  console.log('Request headers:', options.headers);

  // ...

  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }

  let res = await fetch(url, options);
  // console.log(url, options);

  // const res = await window.fetch(url, options);

  if(res.status >= 400) throw res;
  return res;
}

export function restoreCSRF() {
  return csrfFetch('/api/csrf/restore');
}
