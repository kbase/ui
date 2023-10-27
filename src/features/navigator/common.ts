import { Cell } from '../../common/types/NarrativeDoc';
import { generatePathWithSearchParams } from '../../features/params/paramsSlice';

export const AUTOMATIC_REFRESH_DELAY = 15000;
const KBASE_DOMAIN = import.meta.env.VITE_KBASE_DOMAIN || 'ci.kbase.us';

// Narrative and Navigator paths
export const narrativeURL = (wsId: number | string) =>
  `https://${KBASE_DOMAIN}/narrative/${wsId}`;
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

export type UserPermission = 'a' | 'n' | 'r' | 'w';
export const isUserPermission = (key: string): key is UserPermission =>
  new Set('anrw'.split('')).has(key);

export const permissions = {
  a: 'You can view, edit, and share this Narrative.',
  n: 'You have no permissions on this Narrative.',
  r: 'You can view this Narrative, but not edit or share it.',
  w: 'You can view and edit this Narrative, but not share it.',
};

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
