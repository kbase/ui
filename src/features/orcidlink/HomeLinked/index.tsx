/**
 * The initial, or "home", orcidlink view for a user with an existing link.
 *
 * The main job of this specific component is as a controller - to fetch the
 * orcidlink for the user so that it may be displayed to the user - and to
 * provide action properties to allow the user to take actions - remove link,
 * toggle visibility in the user profile.
 *
 * TODO: at present the actions are not implemented; the functionality has been
 * developed but is not implemented here yet in order to reduce the scope of
 * this component.
 */
import { InfoResult, orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import HomeLinked from './view';

export interface HomeLinkedControllerProps {
  info: InfoResult;
  username: string;
}

export default function HomeLinkedController({
  info,
  username,
}: HomeLinkedControllerProps) {
  const {
    data,
    error,
    isUninitialized,
    isError,
    isFetching,
    isLoading,
    isSuccess,
  } = orcidlinkAPI.useOrcidlinkLinkedUserInfoQuery(
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

  if (isUninitialized || isLoading || isFetching) {
    return <Loading title="Loading..." message="Fetching ORCID Link" />;
  } else if (isError) {
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
  } else {
    // I don't think this case is even possible, but TS doesn't know that due to
    // the design of RTK query states.
    return null;
  }
}
