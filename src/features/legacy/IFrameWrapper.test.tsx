import { act, render, waitFor } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  createMemoryRouter,
} from 'react-router-dom';
import {
  CHANNEL_ID,
  UI_ORIGIN,
  WAIT_FOR_INTERVAL,
  WAIT_FOR_TIMEOUT,
  makeWindowMessageSender,
} from '../../common/testUtils';
import IFrameWrapper, { IFrameWrapperProps } from './IFrameWrapper';
import { LEGACY_BASE_ROUTE } from './constants';
import { KBaseUILoggedinPayload } from './messageValidation';
import * as utils from './utils';

/**
 * Renders an iframe wrapper component with router support.
 *
 * @param props
 * @returns
 */
function setupComponentWithRouting4(props: IFrameWrapperProps) {
  const router = createMemoryRouter(
    [
      {
        path: `${LEGACY_BASE_ROUTE()}/*`,
        element: <IFrameWrapper {...props} />,
      },
    ],
    {
      initialEntries: [`${LEGACY_BASE_ROUTE()}/foo`],
      initialIndex: 0,
    }
  );
  const { container } = render(<RouterProvider router={router} />);

  return { container, router };
}

/**
 * Creates an IFrameWrapper component wrapped in a router.
 *
 * Used when we need to rerender with changed props.
 *
 * @param props
 * @returns
 */

// const WrappedIFrameWrapper = (props: IFrameWrapperProps) => {
//   const router = createMemoryRouter(
//     [
//       {
//         path: `${LEGACY_BASE_ROUTE()}/*`,
//         element: <IFrameWrapper {...props} />
//       }
//     ]
//   ,
//   {
//     initialEntries: [`${LEGACY_BASE_ROUTE()}/foo`],
//     initialIndex: 0,
//   });

//   return <RouterProvider router={router} />;
// }

const WrappedIFrameWrapper = (props: IFrameWrapperProps) => {
  return (
    <MemoryRouter initialEntries={[`${LEGACY_BASE_ROUTE()}/foo`]}>
      <Routes>
        <Route
          path={`${LEGACY_BASE_ROUTE()}/foo`}
          element={<IFrameWrapper {...props} />}
        />
      </Routes>
    </MemoryRouter>
  );
};

/**
 * Renders the WrappedIFrameWrapper above in situations in which we don't need to
 * re-render the component, and would like the extra convenience of extracting the
 * contentWindow, which requires some tedious assertions.
 *
 * @param props
 * @returns
 */
const renderWrappedIFrameWrapper = (props: IFrameWrapperProps) => {
  const { container } = render(<WrappedIFrameWrapper {...props} />);

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
};

// Commented out as the test it supports is commented out.
// TODO: sort this out
// function renderIFrameWrapperWithRouting(
//   props: IFrameWrapperProps,
//   onNarratives: () => void
// ) {
//   // TODO: ensure that we can test with a subdomain AND a path.
//   const Narratives = ({ onNarratives }: { onNarratives: () => void }) => {
//     onNarratives();
//     return <div role="label">FOO</div>;
//   };
//   const { container } = render(
//     <MemoryRouter initialEntries={[`${LEGACY_BASE_ROUTE()}/foo`]}>
//       <Routes>
//         <Route
//           path={`/narratives`}
//           element={<Narratives onNarratives={onNarratives} />}
//         />
//         <Route
//           path={`${LEGACY_BASE_ROUTE()}/foo`}
//           element={<IFrameWrapper {...props} />}
//         />
//       </Routes>
//     </MemoryRouter>
//   );

//   const iframe = container.querySelector('iframe');

//   // constrain iframe
//   if (iframe === null) {
//     throw new Error('Impossible - iframe is null');
//   }

//   expect(iframe).toHaveAttribute('title', 'kbase-ui Wrapper');
//   if (iframe.contentWindow === null) {
//     throw new Error('Impossible - iframe contentWindow is null');
//   }

//   return { container, contentWindow: iframe.contentWindow };
// }

/**
 * Simulates what Legacy.tsx would do to prepare props for IFrameWrapper
 * @param propOverrides
 * @returns
 */
function createIFrameProps(
  propOverrides: Partial<IFrameWrapperProps>
): IFrameWrapperProps {
  // Mock the browser location, as we use
  const legacyPath: utils.LegacyPath = {
    path: 'about',
  };

  // Create the props and the component.
  const channel = CHANNEL_ID;
  // TODO: stand up a service here!
  const legacyURL = new URL('http://legacy.localhost');

  legacyURL.hash = `about$`;

  const token = null;

  const setTitle =
    typeof propOverrides.setTitle !== 'undefined'
      ? propOverrides.setTitle
      : (_: string) => {
          return;
        };

  const onLoggedIn =
    typeof propOverrides.onLoggedIn !== 'undefined'
      ? propOverrides.onLoggedIn
      : (_: KBaseUILoggedinPayload) => {
          return;
        };

  const onLogOut =
    typeof propOverrides.onLogOut !== 'undefined'
      ? propOverrides.onLogOut
      : () => {
          return;
        };

  const iframeProps: IFrameWrapperProps = {
    channelId: channel,
    legacyURL,
    token,
    legacyPath,
    spyOnChannels:
      typeof propOverrides.spyOnChannels === 'undefined'
        ? false
        : propOverrides.spyOnChannels,
    setTitle,
    onLoggedIn,
    onLogOut,
  };

  return iframeProps;
}

describe('IFrameWrapper Module', () => {
  let infoLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
    infoLogSpy = jest.spyOn(console, 'info');
  });

  // describe('channelSpy function', () => {
  //   test('logs to the console', () => {
  //     channelSpy(
  //       'SEND',
  //       new ChannelMessage({
  //         name: 'foo',
  //         payload: 'bar',
  //         envelope: { id: 'baz', channel: CHANNEL_ID },
  //       })
  //     );
  //     expect(infoLogSpy).toHaveBeenCalled();
  //     expect(infoLogSpy).toHaveBeenCalledWith(
  //       '[IFrameWrapper][spy][SEND]',
  //       CHANNEL_ID,
  //       'foo'
  //     );
  //   });
  // });

  describe('IFrameWrapper Component', () => {
    /**
     * Ensure that the `kbase-ui.set-title` message is received and handled correctly.
     */
    test('receives "kbase-ui.set-title" normally', async () => {
      // Ensures that the legacy base url is the same as Europa.
      jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

      const EXPECTED_TITLE = 'my title';

      let pageTitle: unknown = null;
      const setTitle = (title: string) => {
        pageTitle = title;
      };

      // Override the iframe props `setTitle` prop.
      const iframeProps = createIFrameProps({ setTitle });

      const { contentWindow } = renderWrappedIFrameWrapper(iframeProps);

      let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
      const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
      const sendMessage = makeWindowMessageSender(contentWindow, window);

      // Here we simulate kbase-ui message handling, which is carried out on the
      // iframe's contentWindow.
      // TODO: redo for the new connection message flow:

      // connect
      //  Europa                      KBase UI
      //  -----------------           ------------------
      //  load kbase-ui
      //                              send kbase-ui.connect({channel})
      //  send europa.connect
      //                              send kbase-ui.connected

      // If navigating ...
      //   send europa.authnavigate

      // Standard connect dance...
      contentWindow.addEventListener('message', (messageEvent) => {
        if ('envelope' in messageEvent.data) {
          if ('channel' in messageEvent.data.envelope) {
            if (
              messageEvent.data.envelope.channel !==
              TEST_KBASE_UI_RECEIVE_CHANNEL
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
        sendMessage('kbase-ui.connect', iframeProps.channelId, {
          channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
        });
      });

      // If the message is received by the IFrameWrapper, it will have called the
      // `setTitle` prop passed to it.
      await waitFor(
        () => {
          expect(pageTitle).toEqual(EXPECTED_TITLE);
        },
        { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
      );
    });

    //   /**
    //    * The basic logic of the above test is replicated, but we install a spy on the send
    //    * and receive channels, and then inspect the console.info log to ensure that the
    //    * log entries for sending and receiving have been made.
    //    */
    test('can receive "kbase-ui.set-title" with a sneaky spy', async () => {
      jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

      const EXPECTED_TITLE = 'my title';
      let pageTitle: unknown = null;
      const setTitle = (title: string) => {
        pageTitle = title;
      };

      const iframeProps = createIFrameProps({ setTitle, spyOnChannels: true });
      iframeProps.spyOnChannels = true;

      const { contentWindow } = renderWrappedIFrameWrapper(iframeProps);

      let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
      const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
      const sendMessage = makeWindowMessageSender(contentWindow, window);

      // Here we simulate kbase-ui message handling.
      // Standard connect dance...
      contentWindow.addEventListener('message', (messageEvent) => {
        if ('envelope' in messageEvent.data) {
          if ('channel' in messageEvent.data.envelope) {
            if (
              messageEvent.data.envelope.channel !==
              TEST_KBASE_UI_RECEIVE_CHANNEL
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
        sendMessage('kbase-ui.connect', iframeProps.channelId, {
          channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
        });
      });

      // If the message is received bi the IFrameWrapper, it will have called the
      // `setTitle` prop passed to it.
      await waitFor(
        () => {
          expect(pageTitle).toEqual('my title');
          expect(infoLogSpy).toHaveBeenNthCalledWith(
            1,
            '[KBaseUIConnection][spy][RECV]',
            CHANNEL_ID,
            'kbase-ui.connect'
          );
          expect(infoLogSpy).toHaveBeenNthCalledWith(
            2,
            '[KBaseUIConnection][spy][SEND]',
            TEST_KBASE_UI_RECEIVE_CHANNEL,
            'europa.connect'
          );
          expect(infoLogSpy).toHaveBeenNthCalledWith(
            3,
            '[KBaseUIConnection][spy][RECV]',
            TEST_EUROPA_RECEIVE_CHANNEL,
            'kbase-ui.connected'
          );
          expect(infoLogSpy).toHaveBeenNthCalledWith(
            4,
            '[KBaseUIConnection][spy][RECV]',
            TEST_EUROPA_RECEIVE_CHANNEL,
            'kbase-ui.set-title'
          );
        },
        { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
      );
    });

    //   /**
    //    * Ensures that the `kbase-ui.logout` message is received and handled properly.
    //    */
    test('Can receive "kbase-ui.logout"', async () => {
      let logoutCalled = false;
      const onLogOut = () => {
        logoutCalled = true;
      };
      jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

      const iframeProps = createIFrameProps({ onLogOut });

      const { contentWindow } = renderWrappedIFrameWrapper(iframeProps);

      let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
      const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
      const sendMessage = makeWindowMessageSender(contentWindow, window);

      // Here we simulate kbase-ui message handling.
      // Standard connect dance...
      contentWindow.addEventListener('message', (messageEvent) => {
        if ('envelope' in messageEvent.data) {
          if ('channel' in messageEvent.data.envelope) {
            if (
              messageEvent.data.envelope.channel !==
              TEST_KBASE_UI_RECEIVE_CHANNEL
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
              // Then some time later, we are simulating a logout event.
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
        sendMessage('kbase-ui.connect', iframeProps.channelId, {
          channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
        });
      });

      await waitFor(
        () => {
          expect(logoutCalled).toEqual(true);
        },
        { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
      );
    });

    //   /**
    //    * Ensure thate the `kbase-ui.loggedin` message without a "nextRequest" is received
    //    * and handled properly.
    //    */
    // DISABLED -
    // TypeError: Cannot read properties of null (reading '_origin')
    //
    //  116 |     };
    //  117 |     const message = new ChannelMessage({ name, payload, envelope });
    // > 118 |     this.window.postMessage(message.toJSON(), this.targetOrigin);
    // test('can receive "kbase-ui.loggedin" without nextRequest', async () => {
    //   let loggedInCalled: KBaseUILoggedinPayload | null = null;
    //   const onLoggedIn = (payload: OnLoggedInParams) => {
    //     loggedInCalled = payload;
    //     payload.onAuthResolved();
    //   };

    //   jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

    //   const iframeProps = createIFrameProps({ onLoggedIn });

    //   let onNarrativesCalled = false;
    //   const onNarratives = () => {
    //     onNarrativesCalled = true;
    //   };

    //   const { contentWindow } = renderIFrameWrapperWithRouting(
    //     iframeProps,
    //     onNarratives
    //   );

    //   const TEST_CHANNEL_ID = 'test_channel';
    //   const sendMessage = makeWindowMessageSender(contentWindow, window);

    //   const loggedInPayload: KBaseUILoggedinPayload = {
    //     token: 'mytoken',
    //     expires: 123,
    //   };

    //   // Here we simulate kbase-ui message handling.
    //   // Standard connect dance...
    //   const messagesReceivedFromEuropa: Array<unknown> = [];
    //   contentWindow.addEventListener('message', (messageEvent) => {
    //     // We want to listen for all 'europa' messages here.
    //     // Simulate reaction to the 'start' message, by sending 'started'.
    //     if ('name' in messageEvent.data) {
    //       if (messageEvent.data.name.startsWith('europa.')) {
    //         messagesReceivedFromEuropa.push(messageEvent.data);
    //       }
    //       // Handle messages to simulate kbase-ui
    //       switch (messageEvent.data.name) {
    //         case 'europa.connect': {
    //           // This is the normal message after connect is received.
    //           act(() => {
    //             sendMessage('kbase-ui.connected', TEST_CHANNEL_ID, {});
    //           });
    //           // Then some time later, we are simulating a logout event.
    //           act(() => {
    //             sendMessage(
    //               'kbase-ui.loggedin',
    //               TEST_CHANNEL_ID,
    //               loggedInPayload
    //             );
    //           });
    //           break;
    //         }
    //       }
    //     }
    //   });

    //   // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
    //   // loaded, and the Europa compatibility layer is ready to receive messages.
    //   act(() => {
    //     sendMessage('kbase-ui.connect', iframeProps.channelId, {
    //       channel: TEST_CHANNEL_ID,
    //     });
    //   });

    //   await waitFor(
    //     () => {
    //       expect(loggedInCalled).toHaveProperty('token', 'mytoken');
    //       expect(loggedInCalled).toHaveProperty('expires', 123);

    //       expect(messagesReceivedFromEuropa.length).toEqual(1);

    //       const startMessage = messagesReceivedFromEuropa[0];
    //       expect(startMessage).toHaveProperty('name', 'europa.connect');

    //       // expect(onNarrativesCalled).toBeTruthy();
    //     },
    //     { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    //   );
    // });

    //   /**
    //    * Ensure that the `kbase-ui.loggedin` message with a nextRequest is received and
    //    * acted up on correctly.
    //    */
    //   test('Can receive kbase-ui.loggedin with nextRequest', async () => {
    //     let loggedInCalled: KBaseUILoggedinPayload | null = null;
    //     const onLoggedIn = (payload: OnLoggedInParams) => {
    //       loggedInCalled = payload;
    //       payload.onAuthResolved();
    //     };

    //     jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

    //     const iframeProps = createIFrameProps({ onLoggedIn });

    //     // const {container} = renderf(<WrappedIFrameWrapper {...iframeProps}/>);
    //     const { contentWindow } = renderWrappedIFrameWrapper(iframeProps);

    //     // const iframe = container.querySelector('iframe');

    //     // // constrain iframe
    //     // if (iframe === null) {
    //     //   throw new Error('Impossible - iframe is null');
    //     // }

    //     // expect(iframe).toHaveAttribute('title', 'kbase-ui Wrapper');
    //     // if (iframe.contentWindow === null) {
    //     //   throw new Error('Impossible - iframe contentWindow is null');
    //     // }

    //     // After receiving the 'ready' message, Europa's legacy layer will have set up
    //     // message listeners for key kbase-ui events, such as 'kbase-ui.set-title', the
    //     // subject of this test.
    //     // So here we simulate kbase-ui sending this message.
    //     const loggedInPayload: KBaseUILoggedinPayload = {
    //       token: 'mytoken',
    //       expires: 123,
    //       nextRequest: {
    //         path: {
    //           path: 'foo',
    //           type: 'kbaseui',
    //         },
    //       },
    //     };

    //     // Here we simulate kbase-ui message handling.
    //     const messagesReceivedFromEuropa: Array<unknown> = [];
    //     contentWindow.addEventListener('message', (messageEvent) => {
    //       // We want to listen for all 'europa' messages here.
    //       // Simulate reaction to the 'start' message, by sending 'started'.
    //       if ('name' in messageEvent.data) {
    //         // Save all the messages for inspection later.
    //         if (messageEvent.data.name.startsWith('europa.')) {
    //           messagesReceivedFromEuropa.push(messageEvent.data);
    //         }
    //         // Handle messages to simulate kbase-ui
    //         if (messageEvent.data.name === 'europa.start') {
    //           // This is the normal message after start is received.
    //           act(() => {
    //             sendFromKBaseUI('kbase-ui.started', iframeProps.channelId, {});
    //           });

    //           // Then some time later, we are simulating a loggedin event.
    //           act(() => {
    //             sendFromKBaseUI(
    //               'kbase-ui.loggedin',
    //               iframeProps.channelId,
    //               loggedInPayload
    //             );
    //           });
    //         }
    //       }
    //     });

    //     // Simulates the initial 'kbase-ui.ready' message sent by kbase-ui when the app has
    //     // loaded, and the Europa compatiblility layer is ready to receive messages.
    //     act(() => {
    //       sendFromKBaseUI('kbase-ui.ready', iframeProps.channelId, {
    //         ready: true,
    //       });
    //     });

    //     await waitFor(
    //       () => {
    //         expect(loggedInCalled).toHaveProperty('token', 'mytoken');
    //         expect(loggedInCalled).toHaveProperty('expires', 123);

    //         expect(messagesReceivedFromEuropa.length).toEqual(3);

    //         const startMessage = messagesReceivedFromEuropa[0];
    //         expect(startMessage).toHaveProperty('name', 'europa.start');
    //         expect(startMessage).toHaveProperty('payload.authToken', null);

    //         const navigationMessage = messagesReceivedFromEuropa[1];
    //         expect(navigationMessage).toHaveProperty('name', 'europa.navigation');

    //         const authenticatedMessage = messagesReceivedFromEuropa[2];
    //         expect(authenticatedMessage).toHaveProperty(
    //           'payload.token',
    //           'mytoken'
    //         );
    //         expect(authenticatedMessage).toHaveProperty(
    //           'payload.nextRequest.path.path',
    //           'foo'
    //         );
    //         expect(authenticatedMessage).toHaveProperty(
    //           'payload.nextRequest.path.type',
    //           'kbaseui'
    //         );
    //       },
    //       { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    //     );
    //   });

    //   /**
    //    * Ensure that if kbase-ui does not send the `kbase-ui.ready` message within the
    //    * timeout limit, an error message is displayed.
    //    *
    //    */
    // test('displays error message if "ready" not received within timeout', async () => {
    //   // Ensures that the legacy base url is the same as Europa.
    //   jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

    //   jest.spyOn(constants, 'READY_WAITING_TIMEOUT').mockReturnValue(100);

    //   const iframeProps = createIFrameProps({});

    //   const { container, contentWindow } =
    //     renderWrappedIFrameWrapper(iframeProps);

    //     const TEST_CHANNEL_ID = 'test_channel';
    //     const sendMessage = makeWindowMessageSender(contentWindow, window);

    //   // Here we simulate kbase-ui message handling.
    //   // const messagesReceivedFromEuropa: Array<unknown> = [];
    //   // contentWindow.addEventListener('message', (messageEvent) => {
    //   //   // We want to listen for all 'europa' messages here.
    //   //   // Simulate reaction to the 'start' message, by sending 'started'.
    //   //   if ('name' in messageEvent.data) {
    //   //     // Save all the messages for inspection later.
    //   //     if (messageEvent.data.name.startsWith('europa.')) {
    //   //       messagesReceivedFromEuropa.push(messageEvent.data);
    //   //     }
    //   //   }
    //   // });

    //   // Here we simulate kbase-ui message handling.
    // // Standard connect dance...
    // const messagesReceivedFromEuropa: Array<unknown> = [];
    // contentWindow.addEventListener('message', (messageEvent) => {
    //   // We want to listen for all 'europa' messages here.
    //   // Simulate reaction to the 'start' message, by sending 'started'.
    //   if ('name' in messageEvent.data) {
    //     if (messageEvent.data.name.startsWith('europa.')) {
    //       messagesReceivedFromEuropa.push(messageEvent.data);
    //     }
    //     // Handle messages to simulate kbase-ui
    //     switch (messageEvent.data.name) {
    //       case 'europa.connect': {
    //         // This is the normal message after connect is received.
    //         act(() => {
    //           sendMessage('kbase-ui.connected', TEST_CHANNEL_ID, {});
    //         });
    //         // Then some time later, we are simulating a logout event.
    //         act(() => {
    //           sendMessage('kbase-ui.logout', TEST_CHANNEL_ID, {});
    //         });
    //         break;
    //       }
    //     }
    //   }
    // });

    // // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
    // // loaded, and the Europa compatibility layer is ready to receive messages.
    // // act(() => {
    // //   sendMessage('kbase-ui.connect', iframeProps.channelId, {
    // //     channel: TEST_CHANNEL_ID,
    // //   });
    // // });

    //   // We DO NOT send the ready message, because we want to force a timeout.

    //   // If the message is received bi the IFrameWrapper, it will have called the
    //   // `setTitle` prop passed to it.
    //   await waitFor(
    //     () => {
    //       expect(container).toHaveTextContent('Timed out after');
    //       expect(container).toHaveTextContent(
    //         'waiting for kbase-ui to be ready'
    //       );
    //     },
    //     { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    //   );
    // });

    //   test('displays error message if "started" not received within timeout', async () => {
    //     // Ensures that the legacy base url is the same as Europa.
    //     jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

    //     jest.spyOn(constants, 'STARTED_WAITING_TIMEOUT').mockReturnValue(100);

    //     const iframeProps = createIFrameProps({});

    //     const { container, contentWindow } =
    //       renderWrappedIFrameWrapper(iframeProps);

    //     // Here we simulate kbase-ui message handling.
    //     const messagesReceivedFromEuropa: Array<unknown> = [];
    //     contentWindow.addEventListener('message', (messageEvent) => {
    //       // We want to listen for all 'europa' messages here.
    //       // Simulate reaction to the 'start' message, by sending 'started'.
    //       if ('name' in messageEvent.data) {
    //         // Save all the messages for inspection later.
    //         if (messageEvent.data.name.startsWith('europa.')) {
    //           messagesReceivedFromEuropa.push(messageEvent.data);
    //         }
    //       }
    //     });

    //     // Simulates the initial 'kbase-ui.ready' message sent by kbase-ui when the app has
    //     // loaded, and the Europa compatiblility layer is ready to receive messages.
    //     act(() => {
    //       sendFromKBaseUI('kbase-ui.ready', iframeProps.channelId, {
    //         ready: true,
    //       });
    //     });

    //     // We DO NOT send the ready message, because we want to force a timeout.

    //     // If the message is received bi the IFrameWrapper, it will have called the
    //     // `setTitle` prop passed to it.
    //     await waitFor(
    //       () => {
    //         expect(container).toHaveTextContent('Timed out after');
    //         expect(container).toHaveTextContent(
    //           'waiting for kbase-ui to start up'
    //         );
    //       },
    //       { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    //     );
    //   });

    test('responds correctly to kbase-ui.navigated - typical usage', async () => {
      // Ensures that the legacy base url is the same as Europa.
      jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

      const iframeProps = createIFrameProps({});

      const { container, router } = setupComponentWithRouting4(iframeProps);

      const iframe = container.querySelector('iframe');

      // constrain iframe
      if (iframe === null) {
        throw new Error('Impossible - iframe is null');
      }

      expect(iframe).toHaveAttribute('title', 'kbase-ui Wrapper');
      if (iframe.contentWindow === null) {
        throw new Error('Impossible - iframe contentWindow is null');
      }

      const contentWindow = iframe.contentWindow;

      let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
      const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
      const sendMessage = makeWindowMessageSender(contentWindow, window);

      // After receiving the 'ready' message, Europa's legacy layer will have set up
      // message listeners for key kbase-ui events, such as 'kbase-ui.set-title', the
      // subject of this test.
      // So here we simulate kbase-ui sending this message.

      // Here we simulate kbase-ui message handling.
      const messagesReceivedFromEuropa: Array<unknown> = [];
      contentWindow.addEventListener('message', (messageEvent) => {
        if ('envelope' in messageEvent.data) {
          if ('channel' in messageEvent.data.envelope) {
            if (
              messageEvent.data.envelope.channel !==
              TEST_KBASE_UI_RECEIVE_CHANNEL
            ) {
              return;
            }
          }
        }

        // We want to listen for all 'europa' messages here.
        // Simulate reaction to the 'start' message, by sending 'started'.
        if ('name' in messageEvent.data) {
          // Save all the messages for inspection later.
          if (messageEvent.data.name.startsWith('europa.')) {
            messagesReceivedFromEuropa.push(messageEvent.data);
          }

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
              // Then some time later, we are simulating a navigation event
              act(() => {
                sendMessage('kbase-ui.navigated', TEST_EUROPA_RECEIVE_CHANNEL, {
                  path: 'bar',
                  params: {},
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
        sendMessage('kbase-ui.connect', iframeProps.channelId, {
          channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
        });
      });

      await waitFor(
        async () => {
          expect(router.state.location.pathname).toEqual('/legacy/bar');
        },
        { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
      );
    });
    // });

    test('responds correctly when the token changes from null to non-null', async () => {
      // Ensures that the legacy base url is the same as Europa.
      jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

      const iframeProps = createIFrameProps({});

      const { rerender, container } = render(
        <WrappedIFrameWrapper {...iframeProps} />
      );

      const iframe = container.querySelector('iframe');

      // constrain iframe
      if (iframe === null) {
        throw new Error('Impossible - iframe is null');
      }

      expect(iframe).toHaveAttribute('title', 'kbase-ui Wrapper');
      if (iframe.contentWindow === null) {
        throw new Error('Impossible - iframe contentWindow is null');
      }

      const contentWindow = iframe.contentWindow;
      let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
      const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
      const sendMessage = makeWindowMessageSender(contentWindow, window);

      // After receiving the 'ready' message, Europa's legacy layer will have set up
      // message listeners for key kbase-ui events, such as 'kbase-ui.set-title', the
      // subject of this test.
      // So here we simulate kbase-ui sending this message.

      // Here we simulate kbase-ui message handling.
      let europaAuthentication: string | null = null;
      const messagesReceivedFromEuropa: Array<unknown> = [];
      contentWindow.addEventListener('message', (messageEvent) => {
        if ('envelope' in messageEvent.data) {
          if ('channel' in messageEvent.data.envelope) {
            if (
              messageEvent.data.envelope.channel !==
              TEST_KBASE_UI_RECEIVE_CHANNEL
            ) {
              return;
            }
          }
        }

        // We want to listen for all 'europa' messages here.
        // Simulate reaction to the 'start' message, by sending 'started'.
        if ('name' in messageEvent.data) {
          // Save all the messages for inspection later.
          if (messageEvent.data.name.startsWith('europa.')) {
            messagesReceivedFromEuropa.push(messageEvent.data);
          }

          // Handle messages to simulate kbase-ui
          switch (messageEvent.data.name) {
            case 'europa.connect': {
              TEST_EUROPA_RECEIVE_CHANNEL = messageEvent.data.payload.channelId;

              // This is the normal message after connect is received.
              act(() => {
                sendMessage(
                  'kbase-ui.connected',
                  TEST_EUROPA_RECEIVE_CHANNEL,
                  {}
                );

                rerender(<WrappedIFrameWrapper {...iframeProps} token="FOO" />);
              });
              break;
            }
            case 'europa.authenticated': {
              europaAuthentication = messageEvent.data.payload.token;
              break;
            }
          }
        }
      });

      // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
      // loaded, and the Europa compatibility layer is ready to receive messages.
      act(() => {
        sendMessage('kbase-ui.connect', iframeProps.channelId, {
          channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
        });
      });

      // If the message is received bi the IFrameWrapper, it will have called the
      // `setTitle` prop passed to it.
      await waitFor(
        async () => {
          expect(europaAuthentication).toEqual('FOO');
        },
        { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
      );
    });

    test('responds correctly when the token changes from non-null to null', async () => {
      // Ensures that the legacy base url is the same as Europa.
      jest.spyOn(utils, 'legacyBaseURL').mockReturnValue(new URL(UI_ORIGIN));

      const iframeProps = createIFrameProps({});

      const { rerender, container } = render(
        <WrappedIFrameWrapper {...iframeProps} token="FOO" />
      );

      const iframe = container.querySelector('iframe');

      // constrain iframe
      if (iframe === null) {
        throw new Error('Impossible - iframe is null');
      }

      expect(iframe).toHaveAttribute('title', 'kbase-ui Wrapper');
      if (iframe.contentWindow === null) {
        throw new Error('Impossible - iframe contentWindow is null');
      }

      const contentWindow = iframe.contentWindow;

      let TEST_EUROPA_RECEIVE_CHANNEL = 'foo';
      const TEST_KBASE_UI_RECEIVE_CHANNEL = 'kbase-ui-receive-channel';
      const sendMessage = makeWindowMessageSender(contentWindow, window);

      // After receiving the 'ready' message, Europa's legacy layer will have set up
      // message listeners for key kbase-ui events, such as 'kbase-ui.set-title', the
      // subject of this test.
      // So here we simulate kbase-ui sending this message.

      // Here we simulate kbase-ui message handling.
      let deauthticatedCalled = false;
      const messagesReceivedFromEuropa: Array<unknown> = [];
      contentWindow.addEventListener('message', (messageEvent) => {
        if ('envelope' in messageEvent.data) {
          if ('channel' in messageEvent.data.envelope) {
            if (
              messageEvent.data.envelope.channel !==
              TEST_KBASE_UI_RECEIVE_CHANNEL
            ) {
              return;
            }
          }
        }

        // We want to listen for all 'europa' messages here.
        // Simulate reaction to the 'start' message, by sending 'started'.
        if ('name' in messageEvent.data) {
          // Save all the messages for inspection later.
          if (messageEvent.data.name.startsWith('europa.')) {
            messagesReceivedFromEuropa.push(messageEvent.data);
          }

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
                rerender(
                  <WrappedIFrameWrapper {...iframeProps} token={null} />
                );
              });
              break;
            }
            case 'europa.deauthenticated':
              deauthticatedCalled = true;
              break;
          }
        }
      });

      // Simulates the initial 'kbase-ui.connect' message sent by kbase-ui when the app has
      // loaded, and the Europa compatibility layer is ready to receive messages.
      act(() => {
        sendMessage('kbase-ui.connect', iframeProps.channelId, {
          channel: TEST_KBASE_UI_RECEIVE_CHANNEL,
        });
      });

      // If the message is received bi the IFrameWrapper, it will have called the
      // `setTitle` prop passed to it.
      await waitFor(
        async () => {
          expect(deauthticatedCalled).toEqual(true);
        },
        { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
      );
    });
  });
});
