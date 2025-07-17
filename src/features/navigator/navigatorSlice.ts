import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import {
  Cell,
  DataObject,
  NarrativeDoc,
} from '../../common/types/NarrativeDoc';
import { SearchResults } from '../../common/api/searchApi';
import { OrgInfo } from '../../common/api/groupsApi';
import { Category, UserPermission } from './common';

// Define a type for the slice state
interface NavigatorState {
  category: Category;
  cells: Cell[];
  cellsLoaded: boolean;
  count: number;
  controlMenu: {
    linkedOrgs: OrgInfo[];
    shares: Record<string, UserPermission>;
    sharesCount: number;
  };
  loading: boolean;
  narrativeDocs: NarrativeDoc[];
  narrativeDocsLookup: Record<number, NarrativeDoc>;
  search_time: number;
  selected: string | null;
  synchronized: boolean;
  synchronizedLast: number;
  users: Record<string, string>;
  wsObjects: Record<number, DataObject[]>;
}

// Define the initial state using that type
const initialState: NavigatorState = {
  category: Category['own'],
  cells: [],
  cellsLoaded: false,
  controlMenu: {
    linkedOrgs: [],
    shares: {},
    sharesCount: 0,
  },
  count: 0,
  loading: false,
  narrativeDocs: [],
  narrativeDocsLookup: {},
  search_time: 0,
  selected: null,
  synchronized: true,
  synchronizedLast: Date.now(),
  users: {},
  wsObjects: {},
};

export const navigatorSlice = createSlice({
  name: 'navigator',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    copyNarrative: (
      state,
      action: PayloadAction<{ name: string; version: number; wsId: number }>
    ) => {
      // For now, wait until the page refreshes to reflect the changes.
      state.synchronizedLast = Date.now();
      state.synchronized = false;
    },
    deleteNarrative: (state, action: PayloadAction<{ wsId: number }>) => {
      const { wsId } = action.payload;
      // set loading state
      state.loading = true;
      // remove the narrative from the list in narrativeDocs
      state.narrativeDocs = state.narrativeDocs.filter(
        (narrativeDoc) => narrativeDoc.access_group !== wsId
      );
      // remove the narrative from narrativeDocsLookup
      delete state.narrativeDocsLookup[wsId];
      // mark the client state as being (possibly) out of sync with KBase
      state.synchronizedLast = Date.now();
      state.synchronized = false;
      return state;
    },
    linkNarrative: (
      state,
      action: PayloadAction<{ org: string; wsId: number }>
    ) => {
      // For now, wait until the page refreshes to reflect the changes.
      state.synchronizedLast = Date.now();
      state.synchronized = false;
    },
    removeShare: (
      state,
      action: PayloadAction<{ username: string; wsId: number }>
    ) => {
      const { username, wsId } = action.payload;
      const { selected } = state;
      const selectedWsId = selected && Number(selected.split('/')[0]);
      if (!selected || selectedWsId !== wsId) {
        throw new Error('Cannot remove share from mismatched workspace.');
      }
      const filtered = Object.fromEntries(
        Object.entries(state.controlMenu.shares).filter(
          ([user]) => user !== username
        )
      );
      const controlMenu = {
        ...state.controlMenu,
        shares: filtered,
        sharesCount: Object.keys(filtered).length,
      };
      const newState = {
        ...state,
        synchronizedLast: Date.now(),
        synchronized: false,
        controlMenu,
      };
      const message = `Remove ${username} permissions for ${wsId}.`;
      console.log(message); // eslint-disable-line no-console
      return newState;
    },
    renameNarrative: (
      state,
      action: PayloadAction<{ name: string; wsId: number }>
    ) => {
      // For now, wait until the page refreshes to reflect the changes.
      state.synchronizedLast = Date.now();
      state.synchronized = false;
    },
    restoreNarrative: (
      state,
      action: PayloadAction<{ objId: number; version: number; wsId: number }>
    ) => {
      // For now, wait until the page refreshes to reflect the changes.
      state.synchronizedLast = Date.now();
      state.synchronized = false;
    },
    select: (state, action: PayloadAction<NavigatorState['selected']>) => {
      state.selected = action.payload;
    },
    setCategory: (state, action: PayloadAction<NavigatorState['category']>) => {
      state.category = action.payload;
    },
    setCells: (state, action: PayloadAction<NavigatorState['cells']>) => {
      state.cells = action.payload;
      state.cellsLoaded = true;
    },
    setCellsLoaded: (
      state,
      action: PayloadAction<NavigatorState['cellsLoaded']>
    ) => {
      state.cellsLoaded = action.payload;
    },
    setLinkedOrgs: (
      state,
      action: PayloadAction<NavigatorState['controlMenu']['linkedOrgs']>
    ) => {
      state.controlMenu.linkedOrgs = action.payload;
    },
    setLoading: (state, action: PayloadAction<NavigatorState['loading']>) => {
      state.loading = action.payload;
    },
    setNarrativeDocs: (
      state,
      action: PayloadAction<SearchResults['getNarratives']>
    ) => {
      const hits = action.payload.hits;
      state.count = action.payload.count;
      state.narrativeDocs = hits;
      state.search_time = action.payload.search_time;
      hits.forEach((hit) => {
        state.wsObjects[hit.access_group] = hit.data_objects;
        state.narrativeDocsLookup[hit.access_group] = hit;
      });
      state.synchronized = true;
      state.synchronizedLast = Date.now();
    },
    setSynchronized: (
      state,
      action: PayloadAction<NavigatorState['synchronized']>
    ) => {
      const syncd = action.payload;
      if (syncd) {
        state.synchronizedLast = Date.now();
      }
      state.synchronized = action.payload;
    },
    setShares: (
      state,
      action: PayloadAction<NavigatorState['controlMenu']['shares']>
    ) => {
      state.controlMenu.shares = action.payload;
      state.controlMenu.sharesCount = Object.keys(action.payload).length;
      return state;
    },
    setUserPermission: (
      state,
      action: PayloadAction<{
        permission: UserPermission;
        username: string;
        wsId: number;
      }>
    ) => {
      const { permission, username, wsId } = action.payload;
      state.controlMenu.shares[username] = permission;
      state.synchronizedLast = Date.now();
      state.synchronized = false;
      const message = `Set ${username} permission on ${wsId} to ${permission}.`;
      console.log(message); // eslint-disable-line no-console
      return state;
    },
    updateUsers: (state, action: PayloadAction<NavigatorState['users']>) => {
      state.users = { ...state.users, ...action.payload };
    },
  },
});

export default navigatorSlice.reducer;
export const {
  copyNarrative,
  deleteNarrative,
  linkNarrative,
  removeShare,
  renameNarrative,
  restoreNarrative,
  select,
  setCategory,
  setCells,
  setCellsLoaded,
  setLinkedOrgs,
  setLoading,
  setNarrativeDocs,
  setShares,
  setSynchronized,
  setUserPermission,
  updateUsers,
} = navigatorSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const categorySelected = (state: RootState) => state.navigator.category;
export const cells = (state: RootState) => state.navigator.cells;
export const cellsLoaded = (state: RootState) => state.navigator.cellsLoaded;
export const loading = (state: RootState) => state.navigator.loading;
export const narrativeDocs = (state: RootState) =>
  state.navigator.narrativeDocs;
export const narrativeDocsLookup = (state: RootState) =>
  state.navigator.narrativeDocsLookup;
export const narrativeDocsCount = (state: RootState) => state.navigator.count;
export const narrativeLinkedOrgs = (state: RootState) =>
  state.navigator.controlMenu.linkedOrgs;
export const navigatorSelected = (state: RootState) => state.navigator.selected;
export const shares = (state: RootState) => state.navigator.controlMenu.shares;
export const sharesCount = (state: RootState) =>
  state.navigator.controlMenu.sharesCount;
export const synchronized = (state: RootState) => state.navigator.synchronized;
export const synchronizedLast = (state: RootState) =>
  state.navigator.synchronizedLast;
export const users = (state: RootState) => state.navigator.users;
export const wsObjects = (state: RootState) => state.navigator.wsObjects;
