import { useEffect, useMemo, useState } from 'react';

export function getCookie(name: string) {
  const cookie = document.cookie
    .split(';')
    .map((kv) => kv.trim().split('='))
    .find(([k, _v]) => k.trim() === name);
  if (cookie) {
    return cookie[1];
  } else {
    return undefined;
  }
}

export function setCookie(
  name: string,
  value: string,
  options?: {
    expires?: Date;
    path?: string | null;
    domain?: string;
    secure?: boolean;
    SameSite?: 'Lax' | 'Strict' | 'None';
  }
) {
  const { expires, path, domain, secure, SameSite } = {
    path: '/',
    secure: true,
    SameSite: 'Lax',
    ...options,
  };
  let cookieString = `${name}=${value}`;
  if (expires) cookieString += `;expires=${expires.toUTCString()}`;
  if (path) cookieString += `;path=${path}`;
  if (domain) cookieString += `;domain=${domain}`;
  if (SameSite) cookieString += `;SameSite=${SameSite}`;
  if (secure) cookieString += ';secure';
  document.cookie = cookieString;
}

export function clearCookie(
  name: string,
  options?: Omit<Parameters<typeof setCookie>[2], 'expires'>
) {
  setCookie(name, '', {
    ...options,
    expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
  });
}

type Rest<T extends unknown[]> = ((...p: T) => void) extends (
  p1: infer P1,
  ...rest: infer R
) => void
  ? R
  : never;

type wrappedFuncs = {
  clear: (
    ...args: Rest<Parameters<typeof clearCookie>>
  ) => ReturnType<typeof clearCookie>;
  set: (
    ...args: Rest<Parameters<typeof setCookie>>
  ) => ReturnType<typeof setCookie>;
};

export function useCookie(name: string) {
  const [value, setValue] = useState<undefined | string>(getCookie(name));

  useEffect(() => {
    const interval = setInterval(() => {
      const cookieVal = getCookie(name);
      if (cookieVal !== value) setValue(cookieVal);
    }, 100);
    return () => clearInterval(interval);
  }, [name, value, setValue]);

  const funcs: wrappedFuncs = useMemo(
    () => ({
      clear: (...args) => {
        const result = clearCookie(name, ...args); // lgtm [js/use-of-returnless-function]
        setValue(getCookie(name));
        return result;
      },
      set: (...args) => {
        const result = setCookie(name, ...args); // lgtm [js/use-of-returnless-function]
        setValue(getCookie(name));
        return result;
      },
    }),
    [name, setValue]
  );

  return [value, funcs.set, funcs.clear] as const;
}
