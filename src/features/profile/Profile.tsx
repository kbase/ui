import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getUserProfile } from '../../common/api/userProfileApi';
import { parseError } from '../../common/api/utils/parseError';
import { Loader } from '../../common/components/Loader';
import { useAppSelector } from '../../common/hooks';
import { authUsername } from '../auth/authSlice';
import { usePageTitle } from '../layout/layoutSlice';
import PageNotFound from '../layout/PageNotFound';
import NarrativeList from '../navigator/NarrativeList/NarrativeList';
import { ProfileEditForm } from './ProfileEditForm';
import classes from './Profile.module.scss';
import { Affiliation, ProfileData } from './profileTypes';

export const ProfileNarrativesMessage: FC<{
  realname: string;
  yours: boolean;
}> = ({ realname, yours }) => {
  if (yours) {
    return <span>Narratives owned by me.</span>;
  }
  return (
    <span>Narratives owned by {realname} which are also accessible to me.</span>
  );
};

export const NarrativesView: FC<{ realname: string; yours: boolean }> = ({
  realname,
  yours,
}) => {
  return (
    <div
      className={classes.narratives}
      role="tabpanel"
      id="narratives-tabpanel"
      aria-labelledby="narratives-tab"
    >
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

export const ProfileView: FC<{
  realname: string;
  username: string;
  profileData: ProfileData;
  viewMine: boolean;
}> = ({ realname, username, profileData, viewMine }) => {
  const [isEditing, setIsEditing] = useState(false);

  const gravatarHash = profileData?.synced?.gravatarHash ?? '';
  const gravatarDefault = profileData?.userdata?.gravatarDefault ?? 'identicon';
  const avatarOption = profileData?.userdata?.avatarOption ?? 'gravatar';
  const avatarSrc =
    avatarOption === 'gravatar' && gravatarHash
      ? `https://www.gravatar.com/avatar/${gravatarHash}?s=300&r=pg&d=${gravatarDefault}`
      : '';
  const researchInterests = profileData?.userdata?.researchInterests ?? [];
  const affiliations = profileData?.userdata?.affiliations ?? [];
  const jobTitle = profileData?.userdata?.jobTitle ?? '';
  const jobTitleDisplay =
    jobTitle === 'Other'
      ? profileData?.userdata?.jobTitleOther ?? ''
      : jobTitle;
  const department = profileData?.userdata?.department ?? '';
  const organization = profileData?.userdata?.organization ?? '';
  const city = profileData?.userdata?.city ?? '';
  const state = profileData?.userdata?.state ?? '';
  const country = profileData?.userdata?.country ?? '';
  const locationParts = [city, state, country].filter(Boolean);
  const location = locationParts.join(', ');
  const researchStatement = profileData?.userdata?.researchStatement ?? '';

  if (isEditing) {
    return (
      <div role="tabpanel" id="profile-tabpanel" aria-labelledby="profile-tab">
        <ProfileEditForm
          profileData={profileData}
          username={username}
          realname={realname}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div role="tabpanel" id="profile-tabpanel" aria-labelledby="profile-tab">
      <Grid container spacing={2}>
        <Grid item md={3}>
          <Stack spacing={2}>
            <Paper>
              <Stack spacing={1}>
                <img src={avatarSrc} alt={`Profile avatar for ${realname}`} />
                <Stack className={classes['profile-names']}>
                  <Typography variant="h2">{realname}</Typography>
                  <Typography variant="h5">{username}</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Paper className={classes['profile-panel']}>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography fontWeight="bold">Position</Typography>
                  <Typography>{jobTitleDisplay || '\u2014'}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography fontWeight="bold">Department</Typography>
                  <Typography>{department || '\u2014'}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography fontWeight="bold">Organization</Typography>
                  <Typography>{organization || '\u2014'}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography fontWeight="bold">Location</Typography>
                  <Typography>{location || '\u2014'}</Typography>
                </Stack>
              </Stack>
            </Paper>
            {viewMine && (
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Stack>
        </Grid>
        <Grid item md={9}>
          <Paper className={classes['profile-panel']}>
            <Stack spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight="bold">
                  Research or Personal Statement
                </Typography>
                <Typography>{researchStatement}</Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight="bold">
                  Research Interests
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                  {researchInterests.map((interest) => (
                    <Chip key={interest} label={interest} />
                  ))}
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight="bold">
                  Affiliations
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Position</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Tenure</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {affiliations.map((affiliation: Affiliation) => (
                      <TableRow
                        key={`${affiliation.title}-${affiliation.organization}`}
                      >
                        <TableCell>{affiliation.title}</TableCell>
                        <TableCell>{affiliation.organization}</TableCell>
                        <TableCell>
                          {affiliation.started} -{' '}
                          {affiliation.ended || 'Present'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export interface ProfileParams {
  narrativesLink: string;
  pageTitle: string;
  profileLink: string;
  profileData: ProfileData;
  realname: string;
  username: string;
  viewMine: boolean;
  viewNarratives: boolean;
}

export const Profile: FC<ProfileParams> = ({
  narrativesLink,
  pageTitle,
  profileLink,
  profileData,
  realname,
  username,
  viewMine,
  viewNarratives,
}) => {
  usePageTitle(pageTitle);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    switch (location.pathname) {
      case profileLink:
        return 0;
      case narrativesLink:
        return 1;
      default:
        return 0;
    }
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <Container>
      <Stack spacing={4}>
        <Tabs value={activeTab} onChange={handleChange}>
          <Tab
            component="a"
            label="Profile"
            id="profile-tab"
            aria-controls="profile-tabpanel"
            onClick={() => navigate(profileLink)}
          />
          <Tab
            component="a"
            label="Narratives"
            id="narratives-tab"
            aria-controls="narratives-tabpanel"
            onClick={() => navigate(narrativesLink)}
          />
        </Tabs>
        <section className={classes['profile-narratives']}>
          {viewNarratives ? (
            <NarrativesView realname={realname} yours={viewMine} />
          ) : (
            <ProfileView
              realname={realname}
              username={username}
              profileData={profileData}
              viewMine={viewMine}
            />
          )}
        </section>
      </Stack>
    </Container>
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
        profileData={profile.profile as ProfileData}
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
