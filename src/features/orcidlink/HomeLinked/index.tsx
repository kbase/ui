import { InfoResult, orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import ErrorMessage from '../common/ErrorMessage';
import LoadingOverlay from '../common/LoadingOverlay';
import HomeLinked from './view';

export interface HomeLinkedControllerProps {
  info: InfoResult;
}

export default function HomeLinkedController({
  info,
}: HomeLinkedControllerProps) {
  const username = useAppSelector(authUsername);

  if (typeof username === 'undefined') {
    throw new Error('Impossible - username is not defined');
  }

  const { data, error, isError, isFetching, isSuccess } =
    orcidlinkAPI.useOrcidlinkLinkedUserInfoQuery(
      { username },
      { refetchOnMountOrArgChange: true }
    );

  const removeLink = () => {
    // This console output is only for this intermediate state of the code, to facilitate testing.
    // eslint-disable-next-line no-console
    console.debug('WILL REMOVE LINK');
  };

  const toggleShowInProfile = () => {
    // This console output is only for this intermediate state of the code, to facilitate testing.
    // eslint-disable-next-line no-console
    console.debug('TOGGLE SHOW IN PROFILE');
  };

  // Renderers
  function renderState() {
    if (isError) {
      return <ErrorMessage error={error} />;
    } else if (isSuccess) {
      const { linkRecord, profile } = data;
      return (
        <HomeLinked
          info={info}
          linkRecord={linkRecord}
          profile={profile}
          removeLink={removeLink}
          toggleShowInProfile={toggleShowInProfile}
        />
      );
    }
  }

  return (
    <>
      <LoadingOverlay open={isFetching} />
      {renderState()}
    </>
  );
}
