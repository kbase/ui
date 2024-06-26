/**
 * This is the "controller" component for the Home view.
 *
 * It is responsible for determining whether the user is already linked or not.
 * If linked it displays the HomeLinked view, which shows the user their link.
 * If not, it displays HomeUnlinked, which explains orcidlink and allows the
 * user to create a link.
 *
 */
import { orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { usePageTitle } from '../../layout/layoutSlice';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import HomeLinked from '../HomeLinked';
import HomeUnlinked from '../HomeUnlinked';

export interface HomeControllerProps {
  username: string;
}

export default function HomeController({ username }: HomeControllerProps) {
  usePageTitle('KBase ORCID Link');

  const { data, error, isFetching, isError, isSuccess } =
    orcidlinkAPI.useOrcidlinkInitialStateQuery({ username });

  if (isFetching) {
    return (
      <Loading title="Loading...">
        Checking for existing link to your account...
      </Loading>
    );
  } else if (isError) {
    return <ErrorMessage error={error} />;
  } else if (isSuccess) {
    if (data.isLinked) {
      return <HomeLinked info={data.info} username={username} />;
    }
    return <HomeUnlinked />;
  } else {
    return <></>;
  }
}
