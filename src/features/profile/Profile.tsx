import { FC, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getUserProfile } from '../../common/api/userProfileApi';
import { parseError } from '../../common/api/utils/parseError';
import { Button } from '../../common/components';
import { Loader } from '../../common/components/Loader';
import { useAppSelector } from '../../common/hooks';
import { authUsername } from '../auth/authSlice';
import { usePageTitle } from '../layout/layoutSlice';
import PageNotFound from '../layout/PageNotFound';
import NarrativeList from '../navigator/NarrativeList/NarrativeList';
import classes from './Profile.module.scss';

/*
 * The following components are stubs due to be written in the future.
 * NarrativesView
 * ProfileInfobox
 * ProfileNarrativesMessage
 * ProfileResume
 * ProfileView
 */

export const ProfileNarrativesMessage: FC<{
  realname: string;
  yours: boolean;
}> = ({ realname, yours }) => {
  if (yours) {
    return <span>This table shows all of your narratives.</span>;
  }
  return (
    <span>
      This table shows all narratives owned by {realname} which are also
      accessible to you.
    </span>
  );
};

export const ProfileResume: FC = () => {
  return <div>Profile Resume</div>;
};

export const NarrativesView: FC<{ realname: string; yours: boolean }> = ({
  realname,
  yours,
}) => {
  return (
    <div className={classes.narratives}>
      <ProfileNarrativesMessage realname={realname} yours={yours} />
      <NarrativeList
        hasMoreItems={false}
        items={[]}
        itemsRemaining={0}
        loading={false}
        narrativeUPA={null}
        nextLimit={''}
        showVersionDropdown
      />
    </div>
  );
};

export const ProfileInfobox: FC<{ realname: string }> = ({ realname }) => {
  return <div>Profile Infobox for {realname}.</div>;
};

export const ProfileView: FC<{ realname: string }> = ({ realname }) => {
  return (
    <div className={classes.profile}>
      <ProfileInfobox realname={realname} />
      <ProfileResume />
    </div>
  );
};

export interface ProfileParams {
  narrativesLink: string;
  pageTitle: string;
  profileLink: string;
  realname: string;
  username: string;
  viewMine: boolean;
  viewNarratives: boolean;
}

export const Profile: FC<ProfileParams> = ({
  narrativesLink,
  pageTitle,
  profileLink,
  realname,
  username,
  viewMine,
  viewNarratives,
}) => {
  usePageTitle(pageTitle);
  return (
    <>
      <nav className={classes['profile-nav']}>
        <ul className="links">
          <li>
            <Link to={profileLink}>Profile</Link>
          </li>
          <li>
            <Link to={narrativesLink}>Narratives</Link>
          </li>
        </ul>
      </nav>
      <section className={classes['profile-narratives']}>
        {viewNarratives ? (
          <NarrativesView realname={realname} yours={viewMine} />
        ) : (
          <ProfileView realname={realname} />
        )}
        <Button>Edit</Button>
      </section>
    </>
  );
};

export const ProfileWrapper: FC = () => {
  const location = useLocation();
  const { usernameRequested } = useParams<{ usernameRequested: string }>();

  const usernameAuthed = useAppSelector(authUsername);

  // Was a username specified in the URL?
  const usernameNotSpecified =
    usernameRequested === 'narratives' || usernameRequested === undefined;
  // Am I looking at my own profile?
  const viewMine = usernameRequested === usernameAuthed || usernameNotSpecified;
  // In any case, whose profile should be shown?
  const viewUsername =
    usernameAuthed && usernameNotSpecified ? usernameAuthed : usernameRequested;

  // Get the profile data
  const profileQueryArgs = useMemo(
    () => ({
      usernames: [viewUsername || ''],
    }),
    [viewUsername]
  );
  const profileQuery = getUserProfile.useQuery(profileQueryArgs, {
    refetchOnMountOrArgChange: true,
    skip: !viewUsername,
  });

  const viewURL = location.pathname.split('/').slice(-1)[0];
  const viewNarratives = viewURL === 'narratives';

  if (profileQuery.isError) {
    // eslint-disable-next-line no-console
    console.error(`Error message: `, parseError(profileQuery?.error));
  }

  if (!usernameAuthed) {
    /* If this component is loaded first (eg. a full page refresh) then the
        authentication state will need to be populated before displaying the
        profile for the current user.
    */
    return <Loader render={'Loading authentication state.'} />;
  } else if (profileQuery.isLoading) {
    return <Loader render={'Loading user profile.'} />;
  } else if (
    profileQuery.isSuccess &&
    viewUsername &&
    profileQuery.data[0][0] // is null when profile DNE
  ) {
    const profile = profileQuery.data[0][0];
    const profileNames = profile.user;
    const realname = profileNames.realname;
    const whoseProfile = viewMine ? 'My ' : `${realname}'s `;
    const pageTitle = realname ? `${whoseProfile} Profile` : '';
    const profileLink = viewMine ? '/profile/' : `/profile/${viewUsername}`;
    const narrativesLink = viewMine
      ? '/profile/narratives'
      : `/profile/${viewUsername}/narratives`;
    return (
      <Profile
        narrativesLink={narrativesLink}
        pageTitle={pageTitle}
        profileLink={profileLink}
        realname={realname}
        username={viewUsername}
        viewMine={viewMine}
        viewNarratives={viewNarratives}
      />
    );
  } else {
    return <PageNotFound />;
  }
};

export default ProfileWrapper;
