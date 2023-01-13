import { generatePath } from 'react-router-dom';

export const narrativeSelectedPath = '/narratives/:id/:obj/:ver';
export const narrativeSelectedPathWithCategory =
  '/narratives/:category/:id/:obj/:ver';
// Types and typeguards
export const navigatorParams = ['limit', 'search', 'sort', 'view'];
export const searchParams = ['search', 'sort'];

export const sortNames = {
  '-updated': 'Recently updated',
  updated: 'Least recently updated',
  '-created': 'Recently created',
  created: 'Oldest',
  lex: 'Lexicographic (A-Za-z)',
  '-lex': 'Reverse Lexicographic',
} as const;

export enum Sort {
  '-updated' = '-updated',
  updated = 'updated',
  '-created' = '-created',
  created = 'created',
  lex = 'lex',
  '-lex' = '-lex',
}

export enum Category {
  own = 'own',
  public = 'public',
  shared = 'shared',
  tutorials = 'tutorials',
}

export type CategoryString = keyof typeof Category;
export const isCategoryString = (key: string): key is CategoryString =>
  key in Category;

export type SortString = keyof typeof Sort;
export const isSortString = (key: string): key is SortString => key in Sort;

// Other functions
// Take a path specification and create a url to that pathname including the
// URL search parameters specified in params
export const generatePathWithSearchParams = (
  pathSpec: string,
  params: Record<string, string>
) => {
  const path = generatePath(pathSpec, params);
  const paramsInPathSpec = Array.from(pathSpec.matchAll(/:\w+/g)).map(
    ([match]) => match.slice(1)
  );
  const pathSearchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(
        ([param, value]) => paramsInPathSpec.indexOf(param) === -1
      )
    )
  ).toString();
  return `${path}?${pathSearchParams}`;
};

export const narrativePath = (parameters: {
  categoryPath: CategoryString | null;
  id: string;
  obj: string;
  ver: string;
  extraParams?: Record<string, string>;
}) => {
  const { categoryPath, extraParams, id, obj, ver } = parameters;
  if (categoryPath) {
    return generatePathWithSearchParams(narrativeSelectedPathWithCategory, {
      category: categoryPath,
      id,
      obj,
      ver,
      ...extraParams,
    });
  }
  return generatePathWithSearchParams(narrativeSelectedPath, {
    id,
    obj,
    ver,
    ...extraParams,
  });
};
