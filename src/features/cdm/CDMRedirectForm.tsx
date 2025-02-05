export const CDMRedirectForm = ({
  ready,
}: {
  ready: (submit: () => void) => void;
}) => {
  // All this page does is send a POST login request to the CDM
  // User will need a cookie for this to succeed.
  //TODO: UDPATE THIS URL
  const CDMOrigin = 'http://127.0.0.1:4043';
  const loginUrl = `${CDMOrigin}/hub/login`;
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
