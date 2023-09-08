/* Delete.test */
import { act, render, screen } from '@testing-library/react';
import fetchMock, {
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import { noOp } from '../../common';
import { testNarrativeDoc, testNarrativeDocFactory } from '../fixtures';
import { DeleteTemplate } from './NarrativeControl.stories';

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

const consoleError = jest.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

describe('The <Delete /> component...', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    consoleError.mockRestore();
    disableFetchMocks();
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
      <DeleteTemplate modalClose={noOp} narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Delete Narrative', { exact: false })
    ).toBeInTheDocument();
  });

  test('attempts to delete a Narrative when confirmed by a user.', async () => {
    const { container } = render(
      <DeleteTemplate modalClose={noOp} narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
    const buttonDelete = container.querySelector('button');
    expect(buttonDelete).toBeTruthy();
    await act(async () => {
      buttonDelete && buttonDelete.click();
    });
  });

  test('throws an error if the delete fails.', async () => {
    fetchMock.mockImplementation(async (req) => {
      const id =
        req &&
        JSON.parse((await (req as Request).body?.toString()) || 'null')?.id;
      const testResponseError = testResponseErrorFactory({
        id,
        wsId: wsIdError,
      });
      const [body, options] = testResponseError;
      return new Response(body, options);
    });
    const { container } = render(
      <DeleteTemplate modalClose={noOp} narrativeDoc={testNarrativeDocError} />
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
      <DeleteTemplate modalClose={noOp} narrativeDoc={testNarrativeDocError} />
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
