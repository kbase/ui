import { generatePath, Location } from 'react-router-dom';
import {
  narrativeSelectedPath,
  narrativeSelectedPathWithCategory,
} from '../../common/routes';

// Take a pathname (relative or absolute) and create a url to that pathname
// preserving the current query parameters
export const keepParams = (parameters: {
  location: Location;
  params: string[];
  link: string;
}): string => {
  const { link, location, params } = parameters;
  const origin = `http${window.isSecureContext ? 's' : ''}://${
    process.env.REACT_APP_KBASE_DOMAIN
  }`;
  // Is the link relative or absolute?
  const linkAbsolute = link[0] === '/';
  // An extra slash is needed eventually if the path is relative.
  const extraSlash = linkAbsolute ? '' : '/';
  // The PUBLIC_URL prefix should be removed from relative links.
  const publicPrefix = process.env.PUBLIC_URL;
  // If the link is absolute then use it for the new pathmame,
  // otherwise use the current path without the publicPrefix.
  const pathnamePrefix = linkAbsolute
    ? ''
    : location.pathname.slice(publicPrefix.length);
  // Create a new URL object with the appropriate href.
  const newLinkHref = origin + pathnamePrefix + extraSlash + link;
  const newLink = new URL(newLinkHref);
  // Remember the desired SearchParams.
  const locSearchParams = new URLSearchParams(location.search);
  params.forEach((param) => {
    const value = locSearchParams.get(param);
    if (value !== null) {
      newLink.searchParams.set(param, value);
    }
  });
  return newLink.pathname + newLink.search;
};

export const keepParamsForLocation = (parameters: {
  location: Location;
  params: string[];
}) => {
  const { location, params } = parameters;
  return (link: string) => keepParams({ location, params, link });
};

export enum Category {
  own = 'own',
  public = 'public',
  shared = 'shared',
  tutorials = 'tutorials',
}

export type CategoryStrings = keyof typeof Category;

export const searchParams = ['search', 'sort'];

export const narrativePath = (parameters: {
  categoryPath: CategoryStrings | null;
  id: string;
  obj: string;
  ver: string;
}) => {
  const { categoryPath, id, obj, ver } = parameters;
  if (categoryPath) {
    return generatePath(narrativeSelectedPathWithCategory, {
      category: categoryPath,
      id,
      obj,
      ver,
    });
  }
  return generatePath(narrativeSelectedPath, {
    id,
    obj,
    ver,
  });
};
