import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { getNarratives, SearchParams } from '../../common/api/searchApi';
import { getwsNarrative } from '../../common/api/workspaceApi';
import { Cell } from '../../common/types/NarrativeDoc';
import { Category, Sort } from './common';
import { cells, narratives, setCells, setNarratives } from './navigatorSlice';

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
  const narrativeQuery = getwsNarrative.useQuery({ upa: narrativeUPA });
  useEffect(() => {
    if (narrativeQuery.isSuccess) {
      const data = narrativeQuery.data;
      if (!data || !data[0]) {
        throw narrativeQuery.error;
      }
      const cells: Cell[] = data[0].data[0].data.cells;
      dispatch(setCells(cells));
    }
  }, [dispatch, cellsPrevious, narrativeQuery, narrativeUPA]);
  return cellsPrevious;
};

export const useNarratives = (params: getNarrativesParams) => {
  const dispatch = useAppDispatch();
  const narrativesPrevious = useAppSelector(narratives);
  const searchAPIParams = useMemo(
    () => makeGetNarrativesParams(params),
    [params]
  );
  const searchAPIQuery = getNarratives.useQuery(searchAPIParams);
  useEffect(() => {
    if (searchAPIQuery.isSuccess && searchAPIQuery.data) {
      const data = searchAPIQuery.data;
      dispatch(setNarratives(data));
    }
  }, [dispatch, narrativesPrevious, searchAPIQuery, searchAPIParams]);
};
