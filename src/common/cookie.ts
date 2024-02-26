import { useEffect, useMemo, useRef, useState } from 'react';

export function getCookie(name?: string) {
  if (!name) return undefined;
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
  name?: string,
  value?: string,
  options?: {
    expires?: Date;
    path?: string | null;
    domain?: string;
    secure?: boolean;
    SameSite?: 'Lax' | 'Strict' | 'None';
  }
) {
  // eslint-disable-next-line no-console
  console.log('setCookie', { name, value, options });
  if (!name) throw new Error('cannot set unnamed cookie');
  const { expires, path, domain, secure, SameSite } = {
    path: '/',
    secure: true,
    SameSite: 'Lax',
    ...options,
  };
  let cookieString = `${name}=${value || ''}`;
  if (expires) cookieString += `;expires=${expires.toUTCString()}`;
  if (path) cookieString += `;path=${path}`;
  if (domain) cookieString += `;domain=${domain}`;
  if (SameSite) cookieString += `;SameSite=${SameSite}`;
  if (secure) cookieString += ';secure';
  document.cookie = cookieString;
}

export function clearCookie(
  name?: string,
  options?: Omit<Parameters<typeof setCookie>[2], 'expires'>
) {
  setCookie(name, '', {
    ...options,
    expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
  });
}

type wrappedFuncs = {
  clear: (
    options?: Parameters<typeof clearCookie>[1]
  ) => ReturnType<typeof clearCookie>;
  set: (
    value: Parameters<typeof setCookie>[1],
    options?: Parameters<typeof setCookie>[2]
  ) => ReturnType<typeof setCookie>;
};

export function useCookie(
  name?: string,
  defaultOptions?: Parameters<typeof setCookie>[2]
) {
  const [value, setValue] = useState<undefined | string>(getCookie(name));
  const defaultOptionsRef = useRef(defaultOptions);
  defaultOptionsRef.current = defaultOptions;

  useEffect(() => {
    if (!name) return;
    const interval = setInterval(() => {
      const cookieVal = getCookie(name);
      if (cookieVal !== value) setValue(cookieVal);
    }, 100);
    return () => clearInterval(interval);
  }, [name, value, setValue]);

  const funcs: wrappedFuncs = useMemo(
    () => ({
      clear: (options) => {
        const result = clearCookie(name, {
          ...defaultOptionsRef.current,
          ...options,
        }); // lgtm [js/use-of-returnless-function]
        setValue(getCookie(name));
        return result;
      },
      set: (value, options) => {
        const result = setCookie(name, value, {
          ...defaultOptionsRef.current,
          ...options,
        }); // lgtm [js/use-of-returnless-function]
        setValue(getCookie(name));
        return result;
      },
    }),
    [name, setValue]
  );

  return [value, funcs.set, funcs.clear] as const;
}
