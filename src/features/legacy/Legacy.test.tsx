import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { makeWindowMessageSender } from '../../common/testUtils';
import * as hooksModule from '../auth/hooks';
import * as layoutSliceModule from '../layout/layoutSlice';
import Legacy from './Legacy';
import { LEGACY_BASE_ROUTE } from './constants';
import { KBaseUILoggedinPayload } from './messageValidation';
import * as utils from './utils';

// Here we mock the module function "createChannelId", which typically creates a uuid,
// but when testing we need to set a specific channel id ... so that we can call it!
jest.mock('./Legacy', () => {
  const originalModule = jest.requireActual('./Legacy');
  return {
    __esModule: true,
    ...originalModule,
    createChannelId: jest.fn(() => {
      return 'fake_channel_id';
    }),
  };
});

// TODO: make the default channel id configurable, so we can overide in testing.
const DEFAULT_CHANNEL_ID = 'europa_kbaseui_channel';

function setupLegacyRouting() {
  jest.spyOn(utils, 'createChannelId').mockReturnValue(DEFAULT_CHANNEL_ID);

  // TODO: ensure that we can test with a subdomain AND a path.
  const { container } = render(
    <Provider store={createTestStore()}>
      {/* <MemoryRouter initialEntries={[`${LEGACY_BASE_ROUTE()}/foo`]}> */}
      <MemoryRouter initialEntries={[`${LEGACY_BASE_ROUTE()}/foo`]}>
        <Routes>
          <Route path={`${LEGACY_BASE_ROUTE()}/*`} element={<Legacy />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  // const sendMessage = makeWindowMessageSender(contentWindow, window);

  // act(() => {
  //   sendWindowMessage('kbase-ui.connect', 'my_channel_id', {
  //     channel: 'foo',
  //   });
  // });

  const iframe = container.querySelector('iframe');

  // constrain iframe
  if (iframe === null) {
    throw new Error('Impossible - iframe is null');
  }

  expect(iframe).toHaveAttribute('title', 'kbase-ui Wrapper');
  if (iframe.contentWindow === null) {
    throw new Error('Impossible - iframe contentWindow is null');
  }

  return { container, contentWindow: iframe.contentWindow };
}

describe('Legacy Component', () => {
  test('Legacy page component receives "kbase-ui.set-title" message and calls the appropriate "use" function', async () => {
    const titleSpy = jest.spyOn(layoutSliceModule, 'usePageTitle');

    const EXPECTED_TITLE = 'Some Title of Unknown Content';
    const LEGACY_ORIGIN = 'http://legacy.localhost';

    jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(LEGACY_ORIGIN));

    const { contentWindow } = setupLegacyRouting();

    let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
    const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
    const sendMessage = makeWindowMessageSender(contentWindow, window);

    contentWindow.addEventListener('message', (messageEvent) => {
      if ('envelope' in messageEvent.data) {
        if ('channel' in messageEvent.data.envelope) {
          if (
            messageEvent.data.envelope.channel !== TEST_KBASE_UI_RECEIVE_CHANNEL
          ) {
            return;
          }
        }
      }
      // We want to listen for all 'europa' messages here.
      // Simulate reaction to the 'start' message, by sending 'started'.
      if ('name' in messageEvent.data) {
        // Handle messages to simulate kbase-ui
        switch (messageEvent.data.name) {
          case 'europa.connect': {
            // Europa's connect contains the channel id it is now listening on.
            TEST_EUROPA_RECEIVE_CHANNEL = messageEvent.data.payload.channelId;
            // This is the normal message after connect is received.
            act(() => {
              sendMessage(
                'kbase-ui.connected',
                TEST_EUROPA_RECEIVE_CHANNEL,
                {}
              );
            });
            // Then some time later, we are simulating a set-title event
            act(() => {
              sendMessage('kbase-ui.set-title', TEST_EUROPA_RECEIVE_CHANNEL, {
                title: EXPECTED_TITLE,
              });
            });
            break;
          }
        }
      }
    });

    // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
    // loaded, and the Europa compatibility layer is ready to receive messages.
    act(() => {
      sendMessage('kbase-ui.connect', DEFAULT_CHANNEL_ID, {
        channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
      });
    });

    await waitFor(() => {
      expect(titleSpy).toHaveBeenCalledWith(EXPECTED_TITLE);
    });
    titleSpy.mockRestore();
  });

  /**
   * This test works by simulating a legacy path, legacy component startup sequence,
   * issuing a  "logged in" message, and the tricky bit is in Legacy.tsx the "login" is
   * handled by setting a state variable which is then picked up by
   * "useTryAuthFromToken". So we measure whether "useTryAuthFromToken" was called with
   * the test token value "foo_token"
   */
  // TODO: redo this test, it no longer works quite like this.
  // Rather useAuthenticateFromToken returns a setToken function which is then called.
  // SO I think we need to mock useAuthenticateFromToken, have it return a mock
  // function, and measure whether this was called.
  test('Legacy page component receives "kbase-ui.loggedin" message and calls the appropriate "set" function', async () => {
    const TEST_TOKEN = 'foo_token';

    // const useTryAuthFromTokenSpy = jest.spyOn(
    //   hooksModule,
    //   'useTryAuthFromToken'
    // );

    let setTokenCalled = false;

    const setTokenSpy = jest
      .spyOn(hooksModule, 'useAuthenticateFromToken')
      .mockImplementation(() => {
        const authenticate = () => {
          setTokenCalled = true;
        };
        return { authenticate };
      });

    jest
      .spyOn(utils, 'legacyBaseURL')
      .mockReturnValue(new URL('http://legacy.localhost'));

    const { contentWindow } = setupLegacyRouting();

    let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
    const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
    const sendMessage = makeWindowMessageSender(contentWindow, window);

    const loggedInPayload: KBaseUILoggedinPayload = {
      token: TEST_TOKEN,
      expires: 12345,
    };

    contentWindow.addEventListener('message', (messageEvent) => {
      if ('envelope' in messageEvent.data) {
        if ('channel' in messageEvent.data.envelope) {
          if (
            messageEvent.data.envelope.channel !== TEST_KBASE_UI_RECEIVE_CHANNEL
          ) {
            return;
          }
        }
      }

      // We want to listen for all 'europa' messages here.
      // Simulate reaction to the 'start' message, by sending 'started'.
      if ('name' in messageEvent.data) {
        // Handle messages to simulate kbase-ui
        switch (messageEvent.data.name) {
          case 'europa.connect': {
            // Europa's connect contains the channel id it is now listening on.
            TEST_EUROPA_RECEIVE_CHANNEL = messageEvent.data.payload.channelId;
            // This is the normal message after connect is received.
            act(() => {
              sendMessage(
                'kbase-ui.connected',
                TEST_EUROPA_RECEIVE_CHANNEL,
                {}
              );
            });
            // Then some time later, we are simulating a set-title event
            act(() => {
              sendMessage(
                'kbase-ui.loggedin',
                TEST_EUROPA_RECEIVE_CHANNEL,
                loggedInPayload
              );
            });
            break;
          }
        }
      }
    });

    // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
    // loaded, and the Europa compatibility layer is ready to receive messages.
    act(() => {
      sendMessage('kbase-ui.connect', DEFAULT_CHANNEL_ID, {
        channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
      });
    });

    // act(() => {
    //   sendMessage('kbase-ui.loggedin', channelId, loggedInPayload);
    // });

    await waitFor(() => {
      // expect(setTokenSpy).toHaveBeenCalledWith(
      //   expect.objectContaining({ token: TEST_TOKEN })
      // );
      expect(setTokenCalled).toBe(true);
    });
    setTokenSpy.mockRestore();
  });

  // /**
  //  * This test works similarly to the above
  //  */
  test('Legacy page component receives kbase-ui.logout message and calls the appropriate "logout" function', async () => {
    let useLogoutCalled = false;
    const useLogoutSpy = jest
      .spyOn(hooksModule, 'useLogout')
      .mockImplementation(() => {
        return () => {
          useLogoutCalled = true;
        };
      });

    jest
      .spyOn(utils, 'legacyBaseURL')
      .mockReturnValue(new URL('http://localhost'));

    const { contentWindow } = setupLegacyRouting();

    let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
    const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
    const sendMessage = makeWindowMessageSender(contentWindow, window);

    contentWindow.addEventListener('message', (messageEvent) => {
      if ('envelope' in messageEvent.data) {
        if ('channel' in messageEvent.data.envelope) {
          if (
            messageEvent.data.envelope.channel !== TEST_KBASE_UI_RECEIVE_CHANNEL
          ) {
            return;
          }
        }
      }

      // We want to listen for all 'europa' messages here.
      // Simulate reaction to the 'start' message, by sending 'started'.
      if ('name' in messageEvent.data) {
        // Handle messages to simulate kbase-ui
        switch (messageEvent.data.name) {
          case 'europa.connect': {
            // Europa's connect contains the channel id it is now listening on.
            TEST_EUROPA_RECEIVE_CHANNEL = messageEvent.data.payload.channelId;
            // This is the normal message after connect is received.
            act(() => {
              sendMessage(
                'kbase-ui.connected',
                TEST_EUROPA_RECEIVE_CHANNEL,
                {}
              );
            });
            // Then some time later, we are simulating a set-title event
            act(() => {
              sendMessage('kbase-ui.logout', TEST_EUROPA_RECEIVE_CHANNEL, {});
            });
            break;
          }
        }
      }
    });

    // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
    // loaded, and the Europa compatibility layer is ready to receive messages.
    act(() => {
      sendMessage('kbase-ui.connect', DEFAULT_CHANNEL_ID, {
        channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
      });
    });

    // sendMessage('kbase-ui.logout', channelId, {});

    await waitFor(() => {
      expect(useLogoutCalled).toEqual(true);
    });
    useLogoutSpy.mockRestore();
  });
});
