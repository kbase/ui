import { useMemo } from 'react';
import { getNarratives } from '../../common/api/searchApi';
import { useAppSelector } from '../../common/hooks';

export const useParamsForNarrativeDropdown = (query: string) => {
  const username = useAppSelector((state) => state.auth.username);
  return useMemo<Parameters<typeof getNarratives.useQuery>[0]>(
    () => ({
      access: {
        only_public: false,
      },
      filters: {
        operator: 'OR',
        fields: [
          {
            field: 'owner',
            term: username,
          },
          {
            field: 'shared_users',
            term: username,
          },
          {
            field: 'is_narratorial',
            term: true,
          },
        ],
      },
      paging: {
        length: 30,
        offset: 0,
      },
      search: {
        query: query ? query : '*',
        fields: ['agg_fields'],
      },
      sorts: [
        ['timestamp', 'desc'],
        ['_score', 'desc'],
      ],
      types: ['KBaseNarrative.Narrative'],
    }),
    [query, username]
  );
};
