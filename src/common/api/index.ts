import { kbaseBaseQuery } from './utils/kbaseBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.DEV
  ? 'http://localhost:3000/'
  : `https://${import.meta.env.VITE_KBASE_DOMAIN}`;

export const baseApi = createApi({
  reducerPath: 'combinedApi',
  baseQuery: kbaseBaseQuery({ baseUrl }),
  endpoints: () => ({}),
});
