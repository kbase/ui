import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { makeCommonError } from '../common/ErrorMessage';
import { INITIAL_STORE_STATE } from '../test/data';
import { CreateLinkStatus } from './controller';
import CreateLinkView from './view';

describe('The CreateLink component', () => {
  const user = userEvent.setup();

  async function expectAccordion(
    container: HTMLElement,
    titleText: string,
    contentText: string
  ) {
    expect(container).toHaveTextContent(titleText);

    const faq1Content = await screen.findByText(new RegExp(contentText), {
      exact: false,
    });

    expect(faq1Content).not.toBeVisible();

    const faq1Title = await screen.findByText(new RegExp(titleText), {
      exact: false,
    });
    await user.click(faq1Title);

    await waitFor(() => {
      expect(faq1Content).toBeVisible();
    });
  }

  it('renders placeholder content', () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{ status: CreateLinkStatus.NONE }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    expect(container).toHaveTextContent('FAQs');
    expect(document.title).toBe('KBase: ORCID Link - Create Link');
  });

  it('renders DETERMINING_ELIGIBILITY state', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{
              status: CreateLinkStatus.DETERMINING_ELIGIBILITY,
            }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Determining Eligibility');
    });
  });

  it('renders CREATING_SESSION state', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{
              status: CreateLinkStatus.CREATING_SESSION,
            }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Creating Linking Session');
    });
  });

  it('renders SESSION_CREATED state', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{
              status: CreateLinkStatus.SESSION_CREATED,
              session_id: 'foo',
            }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Linking Session Created');
    });
  });

  it('renders ERROR state', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{
              status: CreateLinkStatus.ERROR,
              error: makeCommonError({
                message: 'An Error Message',
              }),
            }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('An Error Message');
    });
  });

  it('renders CANCELED state', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{
              status: CreateLinkStatus.CANCELED,
            }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');

      const button = await screen.findByText('Continue to ORCID®');
      expect(button).toBeVisible();
      expect(button).toBeDisabled();
    });
  });

  it('renders CAN_CREATE_SESSION state', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <CreateLinkView
            createLinkState={{
              status: CreateLinkStatus.CAN_CREATE_SESSION,
            }}
            createLinkSession={() => {
              return;
            }}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');

      const button = await screen.findByText('Continue to ORCID®');
      expect(button).toBeVisible();
      expect(button).toBeEnabled();
    });
  });

  it('cancel button returns to the ORCID Link home page', async () => {
    const user = userEvent.setup();
    let fakeHomeCalled = false;
    function FakeHome() {
      fakeHomeCalled = true;
      return <div>FAKE HOME</div>;
    }
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path={'orcidlink/link'}
              element={
                <CreateLinkView
                  createLinkState={{
                    status: CreateLinkStatus.CAN_CREATE_SESSION,
                  }}
                  createLinkSession={() => {
                    return;
                  }}
                />
              }
            />
            <Route path={'orcidlink'} element={<FakeHome />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    expect(container).toHaveTextContent('FAQs');
    expect(document.title).toBe('KBase: ORCID Link - Create Link');

    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(fakeHomeCalled).toBe(true);
    });
  });

  it('continue button returns to the ORCID Link home page', async () => {
    const user = userEvent.setup();
    let createLinkSessionCalled = false;
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path={'orcidlink/link'}
              element={
                <CreateLinkView
                  createLinkState={{
                    status: CreateLinkStatus.CAN_CREATE_SESSION,
                  }}
                  createLinkSession={() => {
                    createLinkSessionCalled = true;
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    expect(container).toHaveTextContent('FAQs');
    expect(document.title).toBe('KBase: ORCID Link - Create Link');

    const continueButton = await screen.findByText('Continue to ORCID®');

    await user.click(continueButton);

    await waitFor(() => {
      expect(createLinkSessionCalled).toBe(true);
    });
  });

  it('faq accordions are present and work', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path={'orcidlink/link'}
              element={
                <CreateLinkView
                  createLinkState={{ status: CreateLinkStatus.NONE }}
                  createLinkSession={() => {
                    return;
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expectAccordion(
      container,
      "What if I don't have an ORCID® Account",
      "But what if you don't have an ORCID® account?"
    );

    expectAccordion(
      container,
      'But I already log in with ORCID®',
      'Your ORCID® sign-in link is only used to obtain your ORCID® iD during sign-in'
    );
  });
});
