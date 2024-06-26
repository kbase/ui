import { render, screen, waitFor } from '@testing-library/react';
import 'core-js/actual/structured-clone';
import fetchMock from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore, RootState } from '../../../app/store';
import { INITIAL_STORE_STATE, INITIAL_STORE_STATE_BAR } from '../test/data';
import { makeOrcidlinkServiceMock } from '../test/orcidlinkServiceMock';
import CreateLinkIndex from './index';

describe('The CreateLinkIndex component', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.enableMocks();
    mockService = makeOrcidlinkServiceMock();
  });

  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  it('renders correct error if no username', async () => {
    const state = structuredClone<Partial<RootState>>(INITIAL_STORE_STATE);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state.auth!.username = undefined;
    const { container } = render(
      <Provider store={createTestStore(state)}>
        <CreateLinkIndex />
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Impossible - username is not present');
  });

  it('renders correct error if no username', async () => {
    const state = structuredClone<Partial<RootState>>(INITIAL_STORE_STATE);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state.auth!.token = undefined;
    const { container } = render(
      <Provider store={createTestStore(state)}>
        <CreateLinkIndex />
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Impossible - no token present');
  });

  it('renders normally for an already-linked user', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE_BAR)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route path="/orcidlink/link" element={<CreateLinkIndex />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(container).toHaveTextContent(
        'Determining whether your account is already linked'
      );
    });

    await waitFor(async () => {
      expect(container).toHaveTextContent('Already Linked');
    });
  });

  it('renders normally for an unlinked user', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/x']}>
          <Routes>
            <Route path="/x" element={<CreateLinkIndex />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(container).toHaveTextContent(
        'Determining whether your account is already linked'
      );
    });

    const button = await screen.findByText('Continue to ORCID®');
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });
});
