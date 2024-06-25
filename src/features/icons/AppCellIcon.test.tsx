import { render, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { makeKBaseServices } from '../../test/kbaseServiceMock';
import AppCellIcon from './AppCellIcon';
import { AppTag } from './iconSlice';

describe('The AppCellIcon', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.enableMocks();
    mockService = makeKBaseServices();
  });

  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  test('renders initial loading icon', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <AppCellIcon appId="SomeModule.someApp" appTag={AppTag.release} />
      </Provider>
    );
    expect(container.querySelector('svg[data-icon="spinner"]')).not.toBeNull();
  });

  test('renders an icon after the callback finishes', async () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <AppCellIcon appId="SomeModule.someApp" appTag={AppTag.beta} />
      </Provider>
    );
    await waitFor(() => {
      expect(
        container.querySelector('svg[data-icon="spinner"]')
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('svg[data-icon="cube"]')
      ).toBeInTheDocument();
    });
  });
});
