/* Delete.test */
import { act, render, screen } from '@testing-library/react';
import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { noOp } from '../../common';
import { testNarrativeDoc, testNarrativeDocFactory } from '../fixtures';
import { Delete } from './Delete';

const fetchMock = createFetchMock(vi);

const wsIdError = 1111111;

export const testNarrativeDocError = testNarrativeDocFactory({
  access_group: wsIdError,
});

const testResponseErrorMessageTemplate = (wsId: number) =>
  `us.kbase.workspace.database.exceptions.NoSuchWorkspaceException: No workspace with id ${wsId} exists`;

const testResponseErrorFactory = ({
  id,
  wsId,
}: {
  id: string;
  wsId: number;
}): [string, { status: number }] => [
  JSON.stringify({
    error: {
      name: 'JSONRPCError',
      code: -32500,
      message: `No workspace with id ${wsId} exists`,
      error: testResponseErrorMessageTemplate(wsId),
    },
    version: '2.0',
    id,
  }),
  { status: 500 },
];

const consoleError = vi.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

const DeleteWrapper = ({
  narrativeDoc,
  modalClose,
}: {
  narrativeDoc: typeof testNarrativeDoc;
  modalClose: () => void;
}) => (
  <Provider store={createTestStore()}>
    <Router>
      <Delete narrativeDoc={narrativeDoc} modalClose={modalClose} />
    </Router>
  </Provider>
);

describe('The <Delete /> component...', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterAll(() => {
    consoleError.mockRestore();
    fetchMock.disableMocks();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
    consoleError.mockClear();
  });

  test('renders.', () => {
    const { container } = render(
      <DeleteWrapper modalClose={noOp} narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Delete Narrative', { exact: false })
    ).toBeInTheDocument();
  });

  test('attempts to delete a Narrative when confirmed by a user.', async () => {
    const { container } = render(
      <DeleteWrapper modalClose={noOp} narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
    const buttonDelete = container.querySelector('button');
    expect(buttonDelete).toBeTruthy();
    await act(async () => {
      buttonDelete && buttonDelete.click();
    });
  });

  test('throws an error if the delete fails.', async () => {
    fetchMock.mockImplementation(async (req: RequestInfo | URL) => {
      const request = req as Request;
      const id =
        request && JSON.parse((await request.body?.toString()) || 'null')?.id;
      const testResponseError = testResponseErrorFactory({
        id,
        wsId: wsIdError,
      });
      const [body, options] = testResponseError;
      return new Response(body, options);
    });
    const { container } = render(
      <DeleteWrapper modalClose={noOp} narrativeDoc={testNarrativeDocError} />
    );
    expect(container).toBeTruthy();
    const buttonDelete = container.querySelector('button');
    expect(buttonDelete).toBeTruthy();
    if (!buttonDelete) throw Error();
    await act(async () => buttonDelete.click());
    expect(buttonDelete.click).toThrow();
  });

  test('throws an error if the delete request fails.', async () => {
    fetchMock.mockRejectedValue(null);
    const { container } = render(
      <DeleteWrapper modalClose={noOp} narrativeDoc={testNarrativeDocError} />
    );
    expect(container).toBeTruthy();
    const buttonDelete = container.querySelector('button');
    expect(buttonDelete).toBeTruthy();
    if (!buttonDelete) throw Error();
    await act(async () => {
      await buttonDelete.click();
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});
