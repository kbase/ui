import { kbaseBaseQuery } from './utils/kbaseBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/'
    : `https://${process.env.REACT_APP_KBASE_DOMAIN}`;

export const baseApi = createApi({
  reducerPath: 'combinedApi',
  baseQuery: kbaseBaseQuery({ baseUrl }),
  endpoints: () => ({}),
});
