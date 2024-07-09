import { createApi } from '@reduxjs/toolkit/query/react';
import { kbaseBaseQuery } from './utils/kbaseBaseQuery';

export const baseUrl = (() => {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'development') {
    return 'http://localhost:3000/';
  } else if (nodeEnv === 'test') {
    // This prevents API calls from attempting to talk to live servers on CI.
    // Tests which utilize actual api calls should either mock the endpoint on
    // localhost, or mock the api itself.
    return 'http://localhost/';
  } else {
    return `https://${process.env.REACT_APP_KBASE_DOMAIN}/`;
  }
})();

export const baseApi = createApi({
  reducerPath: 'combinedApi',
  baseQuery: kbaseBaseQuery({ baseUrl }),
  endpoints: () => ({}),
});
