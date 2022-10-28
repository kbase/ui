import { render, screen, waitFor } from '@testing-library/react';
import fetchMock, {
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import type { MockParams } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';

import {
  Profile,
  ProfileInfobox,
  ProfileNarrativesMessage,
  ProfileResume,
  ProfileView,
  ProfileWrapper,
} from './Profile';

import Routes from '../../app/Routes';
import { createTestStore } from '../../app/store';
import { setAuth, TokenInfo } from '../auth/authSlice';
import { baseApi } from '../../common/api';

export const realname = 'Rosalind Franklin';
export const usernameRequested = 'rosalind-franklin';
export const realnameOther = 'Dorothy Hodgkin';
export const usernameOtherRequested = 'dorothy-hodgkin';

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
      profile: {},
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
          profile: {},
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
            realname={''}
            username={''}
            viewMine={true}
            viewNarratives={true}
          />
        </Router>
      </Provider>
    );
  });

  test('renders ProfileInfobox', () => {
    render(<ProfileInfobox realname={realname} />);
  });

  test('renders ProfileNarrativesMessage for another user', () => {
    render(<ProfileNarrativesMessage realname={realname} yours={false} />);
  });

  test('renders ProfileResume', () => {
    render(<ProfileResume />);
  });

  test('renders ProfileView', () => {
    render(<ProfileView realname={realname} />);
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
    const linkElement = screen.getByText(/infobox/i);
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
      const linkElement = screen.getByText(realnameOther, { exact: false });
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
});
