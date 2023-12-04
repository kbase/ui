import { render } from '@testing-library/react';
import Root from '.';

const consoleInfo = jest.spyOn(console, 'info');
// This mockImplementation supresses console.info calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleInfo.mockImplementation(() => {});

describe('Europa...', () => {
  beforeAll(() => {
    window.gtag = jest.fn();
  });

  afterAll(() => {
    consoleInfo.mockRestore();
  });

  afterEach(() => {
    consoleInfo.mockClear();
  });

  beforeEach(() => {
    consoleInfo.mockClear();
  });

  test('exists.', () => {
    const { container } = render(<Root />);
    expect(container).toBeTruthy();
  });
});
