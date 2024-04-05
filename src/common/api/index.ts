import { kbaseBaseQuery } from './utils/kbaseBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { isLocalDevelopment } from '..';

// If the running in development with kbase-ui, use the configured KBase domain,
// otherwise use localhost with port 3000.
// Note that the latter case implies development directly on the development host.
const baseUrl = isLocalDevelopment()
  ? 'http://localhost:3000/'
  : `https://${process.env.REACT_APP_KBASE_DOMAIN}/`;

export const baseApi = createApi({
  reducerPath: 'combinedApi',
  baseQuery: kbaseBaseQuery({ baseUrl }),
  endpoints: () => ({}),
});
