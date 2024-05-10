import { orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import { usePageTitle } from '../../layout/layoutSlice';
import ErrorMessage from '../common/ErrorMessage';
import Home from './Home';

export default function HomeController() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const username = useAppSelector(authUsername)!;

  usePageTitle('KBase ORCID Link');

  const { data, error, isError, isSuccess } =
    orcidlinkAPI.useOrcidlinkInitialStateQuery({ username });

  if (isError) {
    return <ErrorMessage error={error} />;
  } else if (isSuccess) {
    return <Home isLinked={data.isLinked} info={data.info} />;
  }
  return null;
}
