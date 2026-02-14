import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import fetchMock, {
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import type { MockParams } from 'jest-fetch-mock';
import { ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import Routes from '../../app/Routes';
import { createTestStore } from '../../app/store';
import { baseApi } from '../../common/api';
import { theme } from '../../theme';
import { setAuth, TokenInfo } from '../auth/authSlice';
import {
  realname,
  realnameOther,
  usernameOtherRequested,
  usernameRequested,
} from '../common';
import {
  Profile,
  ProfileNarrativesMessage,
  ProfileView,
  ProfileWrapper,
} from './Profile';
import { ProfileData } from './profileTypes';

const EMPTY_PROFILE_DATA: ProfileData = {
  metadata: { createdBy: 'test', created: new Date().toISOString() },
  preferences: {},
  userdata: {
    organization: '',
    department: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    researchStatement: '',
    gravatarDefault: 'identicon',
    avatarOption: 'gravatar',
    researchInterests: [],
    researchInterestsOther: null,
    jobTitle: '',
    jobTitleOther: '',
    fundingSource: '',
    affiliations: [],
  },
  synced: { gravatarHash: '' },
};

export const initialState = {
  auth: {
    token: 'a token',
    username: usernameRequested,
    initialized: true,
  },
  profile: {
    loggedInProfile: {
      user: {
        username: usernameRequested,
        realname: realname,
      },
      profile: EMPTY_PROFILE_DATA,
    },
  },
};

export const profileResponseOKFactory = (
  username: string,
  realname: string
): [string, MockParams] => [
  JSON.stringify({
    version: '1.1',
    result: [
      [
        {
          user: {
            username: username,
            realname: realname,
          },
          profile: EMPTY_PROFILE_DATA,
        },
      ],
    ],
  }),
  { status: 200 },
];
const profileResponseOK = profileResponseOKFactory(usernameRequested, realname);
const profileResponseNoRealnameOK = profileResponseOKFactory(
  usernameRequested,
  ''
);
const profileOtherResponseOK = profileResponseOKFactory(
  usernameOtherRequested,
  realnameOther
);
let testStore = createTestStore(initialState);

const consoleError = jest.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

describe('Profile related components', () => {
  beforeAll(() => {
    enableFetchMocks();
    window.gtag = jest.fn();
  });
  afterAll(() => {
    consoleError.mockRestore();
    disableFetchMocks();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
    consoleError.mockClear();
    testStore = createTestStore(initialState);
    testStore.dispatch(baseApi.util.resetApiState());
  });

  test('renders Profile', () => {
    render(
      <Provider store={createTestStore()}>
        <Router>
          <Profile
            narrativesLink={''}
            pageTitle={''}
            profileLink={''}
            profileData={EMPTY_PROFILE_DATA}
            realname={''}
            username={''}
            viewMine={true}
            viewNarratives={true}
          />
        </Router>
      </Provider>
    );
  });

  test('renders ProfileNarrativesMessage for another user', () => {
    render(<ProfileNarrativesMessage realname={realname} yours={false} />);
  });

  test('renders ProfileView', () => {
    render(
      <Provider store={createTestStore()}>
        <Router>
          <ProfileView
            realname={realname}
            username={''}
            profileData={EMPTY_PROFILE_DATA}
            viewMine={false}
          />
        </Router>
      </Provider>
    );
  });

  test('renders ProfileWrapper', () => {
    render(
      <Provider store={createTestStore()}>
        <Router>
          <ProfileWrapper />
        </Router>
      </Provider>
    );
    const linkElement = screen.getByText(/auth/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders ProfileWrapper for my profile', async () => {
    fetchMock.mockResponses(profileResponseOK);

    await testStore.dispatch(
      setAuth({
        token: 'some token',
        tokenInfo: {} as TokenInfo,
        username: usernameRequested,
      })
    );

    render(
      <Provider store={testStore}>
        <Router initialEntries={[`/profile`]}>
          <Routes />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const linkElement = screen.getByText(realname, { exact: false });
      expect(linkElement).toBeInTheDocument();
    });
  });

  test('renders ProfileWrapper for my profile, but no realname', async () => {
    fetchMock.mockResponses(profileResponseNoRealnameOK);

    await testStore.dispatch(
      setAuth({
        token: 'some token',
        tokenInfo: {} as TokenInfo,
        username: usernameRequested,
      })
    );

    render(
      <Provider store={testStore}>
        <Router initialEntries={[`/profile`]}>
          <Routes />
        </Router>
      </Provider>
    );
    await waitFor(() =>
      expect(testStore.getState().profile.loggedInProfile?.user.username).toBe(
        usernameRequested
      )
    );
    // With no realname, profile still renders with username visible
    const linkElement = screen.getByText(usernameRequested);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders ProfileWrapper for another profile', async () => {
    fetchMock.mockResponses(profileOtherResponseOK);

    await testStore.dispatch(
      setAuth({
        token: 'some token',
        tokenInfo: {} as TokenInfo,
        username: usernameRequested,
      })
    );

    render(
      <Provider store={testStore}>
        <Router initialEntries={[`/profile/${usernameOtherRequested}`]}>
          <Routes />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const linkElement = screen.getByText(realnameOther, {
        exact: false,
      });
      expect(linkElement).toBeInTheDocument();
    });
  });

  test('renders ProfileWrapper as Page Not Found for viewUsername query error', async () => {
    fetchMock.mockResponses(['', { status: 500 }]);

    render(
      <Provider store={testStore}>
        <Router initialEntries={[`/profile/${usernameRequested}`]}>
          <Routes />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const text = screen.getByText(/Page Not Found/);
      expect(text).toBeInTheDocument();
      expect(consoleError.mock.calls[0][1]).toMatchObject({
        message: 'null',
        status: 500,
      });
    });
  });

  test('shows Edit button when viewing own profile', () => {
    render(
      <Provider store={createTestStore()}>
        <Router>
          <ProfileView
            realname="Test"
            username="test"
            profileData={EMPTY_PROFILE_DATA}
            viewMine={true}
          />
        </Router>
      </Provider>
    );
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  test('hides Edit button when viewing another profile', () => {
    render(
      <Provider store={createTestStore()}>
        <Router>
          <ProfileView
            realname="Test"
            username="test"
            profileData={EMPTY_PROFILE_DATA}
            viewMine={false}
          />
        </Router>
      </Provider>
    );
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  test('clicking Edit Profile shows edit form', () => {
    render(
      <Provider store={createTestStore(initialState)}>
        <ThemeProvider theme={theme}>
          <Router>
            <ProfileView
              realname="Test"
              username="test"
              profileData={EMPTY_PROFILE_DATA}
              viewMine={true}
            />
          </Router>
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
