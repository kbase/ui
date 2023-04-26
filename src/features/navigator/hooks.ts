import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { getUsers } from '../../common/api/authService';
import { getNarratives, SearchParams } from '../../common/api/searchApi';
import { getwsNarrative } from '../../common/api/workspaceApi';
import { Cell } from '../../common/types/NarrativeDoc';
import { authToken } from '../auth/authSlice';
import { Category, Sort, corruptNarrativeError } from './common';
import {
  cells,
  narrativeDocs,
  setCells,
  setCellsLoaded,
  setNarrativeDocs,
  updateUsers,
  users,
} from './navigatorSlice';

const categoryField = (category: Category, username: string) => {
  const { own, public: public_, shared, tutorials } = Category;
  return {
    [own]: [
      {
        field: 'owner',
        term: username,
      },
    ],
    [public_]: [],
    [shared]: [
      {
        field: 'owner',
        not_term: username,
      },
      {
        field: 'shared_users',
        term: username,
      },
    ],
    [tutorials]: [
      {
        field: 'is_narratorial',
        term: true,
      },
    ],
  }[category];
};

const SearchAPISort = {
  '-updated': ['timestamp', 'desc'],
  updated: ['timestamp', 'asc'],
  '-created': ['creation_date', 'desc'],
  created: ['creation_date', 'asc'],
  lex: ['narrative_title.raw', 'asc'],
  '-lex': ['narrative_title.raw', 'desc'],
};

interface getNarrativesParams {
  category: Category;
  limit: number;
  offset: number;
  sort: Sort;
  term: string;
  username?: string;
}

const makeGetNarrativesParams = (
  params: getNarrativesParams
): SearchParams['getNarratives'] => {
  const { category, limit, offset, term, sort, username } = params;
  const { public: public_, tutorials } = Category;
  return {
    access: {
      only_public: category === public_ || category === tutorials,
    },
    filters: {
      operator: 'AND',
      fields: username
        ? categoryField(category, username)
        : categoryField(public_, ''),
    },
    paging: {
      length: limit,
      offset,
    },
    search: {
      query: term ? term : '*',
      fields: ['agg_fields'],
    },
    sorts: [SearchAPISort[sort], ['_score', 'desc']],
    types: ['KBaseNarrative.Narrative'],
  };
};

export const useCells = ({ narrativeUPA }: { narrativeUPA: string }) => {
  const dispatch = useAppDispatch();
  const cellsPrevious = useAppSelector(cells);
  const cellsPreviousSerialized = JSON.stringify(cellsPrevious);
  const narrativeQuery = getwsNarrative.useQuery({ upa: narrativeUPA });
  useEffect(() => {
    dispatch(setCellsLoaded(false));
    console.log({ narrativeQuery }); // eslint-disable-line no-console
    if (narrativeQuery.isSuccess) {
      const data = narrativeQuery.data;
      if (!data || !data[0]) {
        throw narrativeQuery.error;
      }
      const narrative = data[0].data[0].data;
      const cells: Cell[] = narrative.cells;
      if (!cells) {
        corruptNarrativeError(narrativeUPA, narrative);
        dispatch(setCells([]));
        return;
      }
      dispatch(setCells(cells));
    }
  }, [
    dispatch,
    cellsPrevious.length,
    cellsPreviousSerialized,
    narrativeQuery,
    narrativeUPA,
  ]);
  return cellsPrevious;
};

export const useNarratives = (params: getNarrativesParams) => {
  const dispatch = useAppDispatch();
  const narrativesPrevious = useAppSelector(narrativeDocs);
  const searchAPIParams = useMemo(
    () => makeGetNarrativesParams(params),
    [params]
  );
  const searchAPIQuery = getNarratives.useQuery(searchAPIParams);
  useEffect(() => {
    if (searchAPIQuery.isSuccess && searchAPIQuery.data) {
      const data = searchAPIQuery.data;
      dispatch(setNarrativeDocs(data));
    }
  }, [dispatch, narrativesPrevious, searchAPIQuery, searchAPIParams]);
};

export const useUsers = (params: { users: string[] }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(authToken);
  const usersCurrent = useAppSelector(users);
  const authAPIQuery = token ? getUsers.useQuery({ token, ...params }) : null;
  useEffect(() => {
    if (authAPIQuery && authAPIQuery.isSuccess && authAPIQuery.data) {
      const data = authAPIQuery.data;
      const usersUpdated = Object.keys(data).every(
        (key) => usersCurrent[key] === data[key]
      );
      if (!usersUpdated) {
        dispatch(updateUsers(data));
      }
    }
  }, [authAPIQuery, dispatch, params, token, usersCurrent]);
};
