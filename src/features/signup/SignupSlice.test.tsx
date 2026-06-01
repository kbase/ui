import { createTestStore } from '../../app/store';
import { setLoginData } from './SignupSlice';

const makeLoginData = (
  provider: string,
  availablename: string
): Parameters<typeof setLoginData>[0] => ({
  creationallowed: true,
  expires: 0,
  login: [],
  provider,
  create: [
    {
      provemail: 'jane@example.com',
      provfullname: 'Jane Doe',
      availablename,
      id: '123',
      provusername: '0000-0002-1825-0097',
    },
  ],
});

describe('signup setLoginData', () => {
  test('pre-fills username from availablename for non-ORCID providers', () => {
    const store = createTestStore();
    store.dispatch(setLoginData(makeLoginData('Google', 'janedoe')));
    expect(store.getState().signup.account.username).toBe('janedoe');
  });

  test('leaves username blank for ORCID logins to avoid user<N> default', () => {
    const store = createTestStore();
    store.dispatch(setLoginData(makeLoginData('OrcID', 'user1')));
    expect(store.getState().signup.account.username).toBeUndefined();
  });

  test('still pre-fills display name and email for ORCID', () => {
    const store = createTestStore();
    store.dispatch(setLoginData(makeLoginData('OrcID', 'user1')));
    const account = store.getState().signup.account;
    expect(account.display).toBe('Jane Doe');
    expect(account.email).toBe('jane@example.com');
  });
});
