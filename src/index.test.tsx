import { render } from '@testing-library/react';
import Root from '.';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'vitest-dom/extend-expect';

const consoleInfo = vi.spyOn(console, 'info');
// This mockImplementation supresses console.info calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleInfo.mockImplementation(() => {});

describe('Europa...', () => {
  afterAll(() => {
    consoleInfo.mockRestore();
  });

  afterEach(() => {
    consoleInfo.mockClear();
    cleanup();
  });

  beforeEach(() => {
    consoleInfo.mockClear();
  });

  test('exists.', () => {
    const { container } = render(<Root />);
    expect(container).toBeTruthy();
  });
});
