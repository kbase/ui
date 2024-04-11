import { render, waitFor } from '@testing-library/react';
import { WAIT_FOR_INTERVAL, WAIT_FOR_TIMEOUT } from '../../common/testUtils';
import CountdownClock from './CountdownClock';

describe('CountdownClock Component', () => {
  test('renders with minimal props to completion', async () => {
    const { container } = render(
      <CountdownClock duration={300} interval={100} />
    );

    await waitFor(
      () => {
        expect(container).toHaveTextContent('remaining');
      },
      { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    );

    await waitFor(
      () => {
        expect(container).toHaveTextContent('DONE');
      },
      { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    );
  });

  test('does setinterval even work?', async () => {
    let callCount = 0;
    const timer = window.setInterval(() => {
      if (callCount === 5) {
        window.clearInterval(timer);
        return;
      }
      callCount += 1;
    }, 100);

    await waitFor(
      () => {
        expect(callCount).toBe(5);
      },
      { timeout: WAIT_FOR_TIMEOUT, interval: WAIT_FOR_INTERVAL }
    );
  });
});
