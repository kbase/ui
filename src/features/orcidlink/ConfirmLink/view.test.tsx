import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import {
  INITIAL_STORE_STATE,
  LINKING_SESSION_1,
  SERVICE_INFO_1,
} from '../test/data';
import ConfirmLinkView, { ConfirmLinkProps } from './view';

describe('The ContinueLink component', () => {
  const user = userEvent.setup();

  it('the "continue" view correctly', async () => {
    async function doCancelSession() {
      return;
    }

    async function doFinishSession() {
      return;
    }

    const props: ConfirmLinkProps = {
      sessionId: 'foo_session',
      info: SERVICE_INFO_1,
      session: LINKING_SESSION_1,
      doCancelSession,
      canceling: false,
      doFinishSession,
      finishing: false,
    };

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <ConfirmLinkView {...props} />
        </MemoryRouter>
      </Provider>
    );

    // Ensure the sections are all being displayed by checking for their titles.
    expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // Ensure that the timer is being displayed.
    expect(container).toHaveTextContent('The linking session expires in');

    // Ensure that the "Cancel" button is displayed and can be clicked
    const cancelButton = await screen.findByText('Cancel');
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    // Ensure that the "Continue" button is displayed and can be clicked
    const continueButton = await screen.findByText(
      'Finish Creating Your KBase ORCID® Link'
    );
    expect(continueButton).toBeVisible();
    expect(continueButton).toBeEnabled();

    // expect(document.title).toBe('KBase: ORCID Link - Create Link');
  });

  it('the "cancel" button functions correctly', async () => {
    let cancelCalled = false;

    async function doCancelSession() {
      cancelCalled = true;
      return;
    }

    async function doFinishSession() {
      return;
    }

    const props: ConfirmLinkProps = {
      sessionId: 'foo_session',
      info: SERVICE_INFO_1,
      session: LINKING_SESSION_1,
      doCancelSession,
      canceling: false,
      doFinishSession,
      finishing: false,
    };

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <ConfirmLinkView {...props} />
        </MemoryRouter>
      </Provider>
    );

    // Ensure that the "Cancel" button is displayed and can be clicked
    const cancelButton = await screen.findByText('Cancel');
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(cancelCalled).toBe(true);
    });
  });

  it('when canceling, the appropriate message is displayed', async () => {
    async function doCancelSession() {
      return;
    }

    async function doFinishSession() {
      return;
    }

    const props: ConfirmLinkProps = {
      sessionId: 'foo_session',
      info: SERVICE_INFO_1,
      session: LINKING_SESSION_1,
      doCancelSession,
      canceling: true,
      doFinishSession,
      finishing: false,
    };

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <ConfirmLinkView {...props} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'Attempting to cancel your linking session'
      );
    });
  });

  it('the "finish" button functions correctly', async () => {
    let finishCalled = false;

    async function doCancelSession() {
      return;
    }

    async function doFinishSession() {
      finishCalled = true;
      return;
    }

    const props: ConfirmLinkProps = {
      sessionId: 'foo_session',
      info: SERVICE_INFO_1,
      session: LINKING_SESSION_1,
      doCancelSession,
      canceling: false,
      doFinishSession,
      finishing: false,
    };

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <ConfirmLinkView {...props} />
        </MemoryRouter>
      </Provider>
    );

    // Ensure that the "Cancel" button is displayed and can be clicked
    const cancelButton = await screen.findByText(
      'Finish Creating Your KBase ORCID® Link'
    );
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(finishCalled).toBe(true);
    });
  });

  it('when continuing, the appropriate message is displayed', async () => {
    async function doCancelSession() {
      return;
    }

    async function doFinishSession() {
      return;
    }

    const props: ConfirmLinkProps = {
      sessionId: 'foo_session',
      info: SERVICE_INFO_1,
      session: LINKING_SESSION_1,
      doCancelSession,
      canceling: false,
      doFinishSession,
      finishing: true,
    };

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <ConfirmLinkView {...props} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'Attempting to create your KBase ORCID Link'
      );
    });
  });
});
