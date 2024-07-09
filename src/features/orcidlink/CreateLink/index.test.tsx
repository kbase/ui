import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { INITIAL_STORE_STATE } from '../test/data';
import CreateLinkIndex from './index';

describe('The CreateLink component', () => {
  const user = userEvent.setup();
  let debugLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    debugLogSpy = jest.spyOn(console, 'debug');
  });

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
          <CreateLinkIndex />
        </MemoryRouter>
      </Provider>
    );

    expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    expect(container).toHaveTextContent('FAQs');
    expect(document.title).toBe('KBase: ORCID Link - Create Link');
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
            <Route path={'orcidlink/link'} element={<CreateLinkIndex />} />
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

  it('cancel button returns to the ORCID Link home page', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route path={'orcidlink/link'} element={<CreateLinkIndex />} />
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
      expect(debugLogSpy).toHaveBeenCalledWith(
        'WILL START THE LINKING PROCESS'
      );
    });
  });

  it('faq accordions are present and work', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route path={'orcidlink/link'} element={<CreateLinkIndex />} />
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
