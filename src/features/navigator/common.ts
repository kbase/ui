import { Cell } from '../../common/types/NarrativeDoc';
import { generatePathWithSearchParams } from '../../features/params/paramsSlice';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const emptyFunction = () => {};

// Narrative and Navigator paths
export const narrativeURL = (wsId: number | string) =>
  `https://ci.kbase.us/narrative/${wsId}`;
export const navigatorPath = '/narratives/:id/:obj/:ver';
export const navigatorPathWithCategory = '/narratives/:category/:id/:obj/:ver';
export const generateNavigatorPath = (parameters: {
  categoryPath: CategoryString | '';
  id: string;
  obj: string;
  ver: string;
  extraParams?: Record<string, string>;
}) => {
  const { categoryPath, extraParams, id, obj, ver } = parameters;
  if (categoryPath) {
    return generatePathWithSearchParams(navigatorPathWithCategory, {
      category: categoryPath,
      id,
      obj,
      ver,
      ...extraParams,
    });
  }
  return generatePathWithSearchParams(navigatorPath, {
    id,
    obj,
    ver,
    ...extraParams,
  });
};

// Types and typeguards
export const navigatorParams = ['limit', 'search', 'sort', 'view'];
export const searchParams = ['limit', 'search', 'sort'];

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
export const corruptCellError = (cell: Cell, index: number) => {
  // eslint-disable-next-line no-console
  console.error('Corrupted narrative cell detected.', { cell, index });
};

export const corruptNarrativeError = (
  narrativeUPA: string,
  narrative?: unknown
) => {
  // eslint-disable-next-line no-console
  console.error(`Corrupted narrative object detected: ${narrativeUPA}`, {
    narrative,
  });
};

export const normalizeVersion = (verRaw?: number | string) => {
  if (typeof verRaw === 'undefined') {
    return;
  }
  const verNumber = Number(verRaw);
  if (!Number.isFinite(verNumber)) {
    throw Error('Version must be finite if specified.');
  }
  if (!Number.isInteger(verNumber)) {
    throw Error('Version must be an integer if specified.');
  }
  if (verNumber < 1) {
    throw Error('Version must be positive if specified.');
  }
  if (verNumber > Number.MAX_SAFE_INTEGER) {
    throw Error('Version not supported.');
  }
  return verNumber.toString();
};
