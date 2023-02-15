import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { getSearch, SearchParams } from '../../common/api/searchApi';
import { Category, Sort } from './common';
import { narratives, setNarratives } from './navigatorSlice';

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

export const useNarratives = (params: getNarrativesParams) => {
  const dispatch = useAppDispatch();
  const narrativesPrevious = useAppSelector(narratives);
  const searchQuery = makeGetNarrativesParams(params);
  const query = getSearch.useQuery(searchQuery);
  useEffect(() => {
    if (query.isSuccess) {
      const data = query.data;
      dispatch(setNarratives(data));
    }
  }, [dispatch, narrativesPrevious, query, searchQuery]);
};
