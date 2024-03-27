import { usePageTitle } from './layoutSlice';

export const TITLE = 'Page Not Found';

export interface PageNotFoundProps {
  message?: string;
}
const PageNotFound = ({ message }: PageNotFoundProps) => {
  function renderMessage() {
    if (message) {
      return <p>{message}</p>;
    }
  }
  usePageTitle(TITLE);
  return (
    <section>
      <h2>{TITLE}</h2>
      {renderMessage()}
    </section>
  );
};

export default PageNotFound;
