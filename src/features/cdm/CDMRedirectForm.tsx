export const CDMRedirectForm = ({
  ready,
}: {
  ready: (submit: () => void) => void;
}) => {
  // All this page does is send a POST login request to the CDM
  // User will need a cookie for this to succeed.
  const KBASE_DOMAIN = process.env.REACT_APP_KBASE_DOMAIN || 'ci.kbase.us';
  const loginUrl = `https://cdmhub.${KBASE_DOMAIN}/hub/login`;
  return (
    <form
      style={{ display: 'none' }}
      method="POST"
      action={loginUrl}
      ref={(formElement) => {
        if (formElement)
          ready(() => {
            formElement?.submit();
          });
      }}
    ></form>
  );
};
