import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { JSONRPC20Request } from '../common/api/JSONRPC20';
import {
  INITIAL_STORE_STATE,
  LINK_RECORD_1,
  PROFILE_1,
  SERVICE_INFO_1,
} from '../test/data';
import { makeJSONRPC20Server } from '../test/jsonrpc20ServiceMock';
import HomeLinkedController from './index';

describe('The HomeLinkedController component', () => {
  let debugLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.enableMocks();
    debugLogSpy = jest.spyOn(console, 'debug');
  });

  it('renders normally for a normal, linked user', async () => {
    const info = SERVICE_INFO_1;

    makeJSONRPC20Server([
      {
        path: '/services/orcidlink/api/v1',
        method: 'owner-link',
        result: (rpc: JSONRPC20Request) => {
          return LINK_RECORD_1;
        },
      },
      {
        path: '/services/orcidlink/api/v1',
        method: 'get-orcid-profile',
        result: (rpc: JSONRPC20Request) => {
          return PROFILE_1;
        },
      },
      {
        path: '/services/orcidlink/api/v1',
        method: 'info',
        result: (rpc: JSONRPC20Request) => {
          return SERVICE_INFO_1;
        },
      },
    ]);

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeLinkedController
            info={info}
            username={INITIAL_STORE_STATE.auth.username}
          />
        </MemoryRouter>
      </Provider>
    );

    // Now poke around and make sure things are there.
    await waitFor(async () => {
      expect(screen.queryByText('Fetching ORCID Link')).toBeVisible();
    });

    screen.queryByText('5/1/24');
    await waitFor(async () => {
      // Ensure some expected fields are rendered.
      expect(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        screen.queryByText(PROFILE_1.nameGroup.fields!.creditName!)
      ).toBeVisible();
      expect(screen.queryByText('5/1/24')).toBeVisible();
    });
  });

  it('renders an error if something goes wrong', async () => {
    // We arrange for something to go wrong. How about ... token doesn't exist.
    makeJSONRPC20Server([
      {
        path: '/services/orcidlink/api/v1',
        method: 'owner-link',
        error: (rpc: JSONRPC20Request) => {
          return {
            code: 1010,
            message: 'Authorization Required',
          };
        },
      },
      {
        path: '/services/orcidlink/api/v1',
        method: 'get-orcid-profile',
        result: (rpc: JSONRPC20Request) => {
          return PROFILE_1;
        },
      },
      {
        path: '/services/orcidlink/api/v1',
        method: 'info',
        result: (rpc: JSONRPC20Request) => {
          return SERVICE_INFO_1;
        },
      },
    ]);

    const info = SERVICE_INFO_1;

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeLinkedController
            info={info}
            username={INITIAL_STORE_STATE.auth.username}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(async () => {
      await expect(container).toHaveTextContent('Authorization Required');
    });
  });

  it('responds as expected to the remove link button being pressed', async () => {
    const user = userEvent.setup();

    makeJSONRPC20Server([
      {
        path: '/services/orcidlink/api/v1',
        method: 'owner-link',
        result: (rpc: JSONRPC20Request) => {
          return LINK_RECORD_1;
        },
      },
      {
        path: '/services/orcidlink/api/v1',
        method: 'get-orcid-profile',
        result: (rpc: JSONRPC20Request) => {
          return PROFILE_1;
        },
      },
      {
        path: '/services/orcidlink/api/v1',
        method: 'info',
        result: (rpc: JSONRPC20Request) => {
          return SERVICE_INFO_1;
        },
      },
    ]);

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeLinkedController
            info={SERVICE_INFO_1}
            username={INITIAL_STORE_STATE.auth.username}
          />
        </MemoryRouter>
      </Provider>
    );

    // Now poke around and make sure things are there.

    // A loading indicator should appear, briefly.
    await waitFor(async () => {
      expect(screen.queryByText('Fetching ORCID Link')).toBeVisible();
    });

    // THe user's ORCID profile summary should be displayed.
    await waitFor(async () => {
      // Ensure some expected fields are rendered.
      expect(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        screen.queryByText(PROFILE_1.nameGroup.fields!.creditName!)
      ).toBeVisible();
      expect(screen.queryByText('5/1/24')).toBeVisible();
    });

    // Now to test what we are here for...

    // First open the manage tab
    const tab = await screen.findByText('Manage Your Link');
    expect(tab).not.toBeNull();
    await user.click(tab);

    // Ensure that the "card" with the expected title is displayed
    await waitFor(() => {
      expect(screen.queryByText('Remove your KBase ORCID® Link')).toBeVisible();
    });

    // Now find and click the Remove button
    const button = await screen.findByText('Remove KBase ORCID® Link …');
    expect(button).toBeVisible();
    await user.click(button);

    // Now the dialog should be displayed.
    await waitFor(() => {
      const title = screen.queryByText('Confirm Removal of ORCID® Link');
      expect(title).toBeVisible();
    });

    // And now we locate and click the button that will remove the link.
    const confirmButton = await screen.findByText(
      'Yes, go ahead and remove this link'
    );
    expect(confirmButton).toBeVisible();
    await user.click(confirmButton);

    // Since we haven't implemented the removal yet, console logging is used to
    // provide something to test for.
    await waitFor(() => {
      expect(debugLogSpy).toHaveBeenCalledWith('WILL REMOVE LINK');
    });
  });
});
