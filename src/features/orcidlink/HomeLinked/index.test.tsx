import { render, screen, waitFor } from '@testing-library/react';
import fetchMock, { MockResponseInit } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import {
  INITIAL_STORE_STATE,
  LINK_RECORD_1,
  ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED,
  PROFILE_1,
  SERVICE_INFO_1,
} from '../test/data';
import {
  jsonRPC20_ErrorResponse,
  jsonRPC20_ResultResponse,
  mockIsLinked,
} from '../test/mocks';
import HomeLinkedController from './index';

function setupMockRegularUser() {
  fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 300);
      });
      switch (pathname) {
        // Mocks for the orcidlink api
        case '/services/orcidlink/api/v1': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();
          const id = body['id'];
          switch (body['method']) {
            case 'is-linked':
              // In this mock, user "foo" is linked, user "bar" is not.
              return jsonRPC20_ResultResponse(id, mockIsLinked(body));
            case 'get-orcid-profile':
              // simulate fetching an orcid profile
              return jsonRPC20_ResultResponse(id, PROFILE_1);
            case 'owner-link':
              // simulate fetching the link record for a user
              return jsonRPC20_ResultResponse(id, LINK_RECORD_1);
            case 'info':
              // simulate getting service info.
              return jsonRPC20_ResultResponse(id, SERVICE_INFO_1);
            default:
              return '';
          }
        }
        default:
          return '';
      }
    }
  );
}

function setupMockRegularUserWithError() {
  fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 300);
      });
      switch (pathname) {
        // MOcks for the orcidlink api
        case '/services/orcidlink/api/v1': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();
          const id = body['id'] as string;
          switch (body['method']) {
            case 'is-linked':
              return jsonRPC20_ErrorResponse(
                id,
                ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED
              );
            case 'get-orcid-profile': {
              return jsonRPC20_ErrorResponse(
                id,
                ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED
              );
            }
            case 'owner-link':
              // simulate fetching the link record for a user
              return jsonRPC20_ResultResponse(id, LINK_RECORD_1);

            case 'info':
              // simulate getting service info
              return jsonRPC20_ResultResponse(id, SERVICE_INFO_1);

            default:
              return '';
          }
        }
        default:
          return '';
      }
    }
  );
}

describe('The HomeLinkedController component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.enableMocks();
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
});
