import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import {
  INITIAL_STORE_STATE,
  INITIAL_UNAUTHENTICATED_STORE_STATE,
  PROFILE_1,
  SERVICE_INFO_1,
} from '../test/data';
import {
  setupMockRegularUser,
  setupMockRegularUserWithError,
} from '../test/mocks';
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

  it('renders normally for a normal user', async () => {
    setupMockRegularUser();

    const info = SERVICE_INFO_1;

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeLinkedController info={info} />
        </MemoryRouter>
      </Provider>
    );

    // Now poke around and make sure things are there.
    await waitFor(async () => {
      expect(screen.queryByText('Loading ORCID Link')).toBeVisible();
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
    /**
    We arrange for something to go wrong. How about ... token doesn't exist.
     */
    setupMockRegularUserWithError();

    const info = SERVICE_INFO_1;

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeLinkedController info={info} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(async () => {
      await expect(container).toHaveTextContent('Authorization Required');
    });
  });

  it('throws an impossible error if called without authentication', async () => {
    const { container } = render(
      <ErrorBoundary
        fallbackRender={({ error }) => {
          return <div>{error.message}</div>;
        }}
        onError={() => {
          // noop
        }}
      >
        <Provider store={createTestStore(INITIAL_UNAUTHENTICATED_STORE_STATE)}>
          <MemoryRouter initialEntries={['/foo']}>
            <HomeLinkedController info={SERVICE_INFO_1} />
          </MemoryRouter>
        </Provider>
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'Impossible - username is not defined'
      );
    });
  });

  it('responds as expected to the remove link button being pressed', async () => {
    const user = userEvent.setup();
    setupMockRegularUser();

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeLinkedController info={SERVICE_INFO_1} />
        </MemoryRouter>
      </Provider>
    );

    // Now poke around and make sure things are there.
    await waitFor(async () => {
      expect(screen.queryByText('Loading ORCID Link')).toBeVisible();
    });

    await waitFor(async () => {
      // Ensure some expected fields are rendered.
      expect(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        screen.queryByText(PROFILE_1.nameGroup.fields!.creditName!)
      ).toBeVisible();
      expect(screen.queryByText('5/1/24')).toBeVisible();
    });

    // First need to open the manage tab

    const tab = await screen.findByText('Manage Your Link');
    expect(tab).not.toBeNull();
    await user.click(tab);

    await waitFor(() => {
      expect(
        screen.queryByText('Remove your KBase ORCID® Link')
      ).not.toBeNull();
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

    const confirmButton = await screen.findByText(
      'Yes, go ahead and remove this link'
    );
    expect(confirmButton).toBeVisible();
    await user.click(confirmButton);

    await waitFor(() => {
      expect(debugLogSpy).toHaveBeenCalledWith('WILL REMOVE LINK');
    });
  });
});
