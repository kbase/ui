import { generatePathWithSearchParams } from '../../features/params/paramsSlice';

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
