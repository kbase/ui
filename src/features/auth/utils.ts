export const makeAuthFlowURLs = (
  target: 'login' | 'link',
  redirectPath: string,
  nextRequest?: string
) => {
  // OAuth Login wont work in dev mode, so send dev users to CI so they can grab their token
  const loginOrigin =
    process.env.NODE_ENV === 'development'
      ? 'https://ci.kbase.us'
      : document.location.origin;

  // In prod, the canonical auth domain is kbase.us, not narrative.kbase.us
  // navigating instead to narrative.kbase.us will set the internal cookie
  // on the wrong domain.
  const authOrigin =
    loginOrigin === 'https://narrative.kbase.us'
      ? 'https://kbase.us'
      : loginOrigin;

  // Triggering login requires a form POST submission
  const actionUrl = new URL(
    target === 'login'
      ? '/services/auth/login/start/'
      : '/services/auth/link/start/',
    authOrigin
  ).toString();

  // Redirect URL is used to pass state to login/continue
  const redirectUrl = new URL(`${loginOrigin}/${redirectPath}`);
  redirectUrl.searchParams.set(
    'state',
    JSON.stringify({
      nextRequest: nextRequest,
      origin: loginOrigin,
    })
  );

  return { loginOrigin, actionUrl, redirectUrl };
};
