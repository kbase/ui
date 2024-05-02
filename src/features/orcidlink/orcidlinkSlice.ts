import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

// Define data model (state)
export interface ORCIDLinkState {
  foo: string;
  link: boolean;
}

// Define slice
export const orcidlinkSlice = createSlice({
  name: 'orcidlink',
  initialState: {
    foo: 'bar',
    link: false,
  },
  reducers: {},
});

// Queries
export const orcidlink = ({ orcidlink }: RootState) => {
  return orcidlink;
};

export default orcidlinkSlice.reducer;
