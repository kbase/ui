import { orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import { usePageTitle } from '../../layout/layoutSlice';
import ErrorMessage from '../common/ErrorMessage';
import Home from './Home';

export default function HomeController() {
  const username = useAppSelector(authUsername);

  if (typeof username === 'undefined') {
    throw new Error('Impossible - username is not defined');
  }

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
