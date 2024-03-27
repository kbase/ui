import { waitFor } from '@testing-library/react';
import { UI_ORIGIN, WAIT_FOR_TIMEOUT } from '../testUtils';
import SendChannel, { ChannelMessage } from './SendChannel';

describe('SendChannel', () => {
  let errorLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
    errorLogSpy = jest.spyOn(console, 'error');
  });

  test('can be created', () => {
    const channel = 'abc123';
    const targetOrigin = UI_ORIGIN;
    const sendChannel = new SendChannel({ window, channel, targetOrigin });
    expect(sendChannel).toBeTruthy();
  });

  test('can send a message', async () => {
    const channel = 'abc123';
    const targetOrigin = UI_ORIGIN;
    const sendChannel = new SendChannel({ window, channel, targetOrigin });
    expect(sendChannel).toBeTruthy();

    // We'll set up a listener on this window.
    let receivedMessage: unknown = null;
    let monitorValue: unknown = null;
    window.addEventListener('message', (ev) => {
      monitorValue = 'bar';
      receivedMessage = ev.data;
    });

    const message = sendChannel.send('foo', 'bar');

    const expectedMessage = {
      name: 'foo',
      envelope: { channel, id: message.envelope.id },
      payload: 'bar',
    };

    await waitFor(() => {
      expect(receivedMessage).toEqual(expectedMessage);
      expect(receivedMessage).toEqual(message);
      expect(monitorValue).toEqual('bar');
    });
  });

  test('can change the channel', async () => {
    const initialChannel = 'abc123';
    const secondChannel = 'def456';
    const targetOrigin = UI_ORIGIN;
    const sendChannel = new SendChannel({
      window,
      channel: initialChannel,
      targetOrigin,
    });
    expect(sendChannel).toBeTruthy();

    // We'll set up a listener on this window.
    let receivedMessage: unknown = null;
    let monitorValue: unknown = null;
    window.addEventListener('message', (ev) => {
      monitorValue = 'bar';
      receivedMessage = ev.data;
    });

    const message = sendChannel.send('foo', 'bar');

    await waitFor(() => {
      expect(receivedMessage).toEqual({
        name: 'foo',
        envelope: { channel: initialChannel, id: message.envelope.id },
        payload: 'bar',
      });
      expect(receivedMessage).toEqual(message);
      expect(monitorValue).toEqual('bar');
    });

    sendChannel.setChannelId(secondChannel);

    const secondMessage = sendChannel.send('baz', 'fizz');

    await waitFor(() => {
      expect(receivedMessage).toEqual({
        name: 'baz',
        envelope: { channel: secondChannel, id: secondMessage.envelope.id },
        payload: 'fizz',
      });
      expect(receivedMessage).toEqual(secondMessage);
      expect(monitorValue).toEqual('bar');
    });
  });

  test('can spy on message send', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    let spied: unknown = null;
    const spy = (message: ChannelMessage) => {
      spied = message.payload;
    };
    const targetOrigin = UI_ORIGIN;

    const sendChannel = new SendChannel({ window, channel, targetOrigin, spy });

    sendChannel.send(messageName, expectedPayload);

    await waitFor(
      () => {
        expect(spied).toEqual(expectedPayload);
      },
      { timeout: WAIT_FOR_TIMEOUT }
    );
  });

  test('emits an error message to the console if a spy throws', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    const spy = (_message: ChannelMessage) => {
      throw new Error('Oops, I did it again');
    };
    const targetOrigin = UI_ORIGIN;

    const sendChannel = new SendChannel({ window, channel, targetOrigin, spy });

    sendChannel.send(messageName, expectedPayload);

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith(
          'Error running spy',
          'Oops, I did it again',
          expect.any(Error)
        );
      },
      { timeout: WAIT_FOR_TIMEOUT }
    );
  });

  test('emits an error message to the console if a spy throws a non-Error object', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';
    const errorMessage = 'A string is not an Error!';

    const spy = (_message: ChannelMessage) => {
      // eslint-disable-next-line no-throw-literal
      throw errorMessage;
    };
    const targetOrigin = UI_ORIGIN;

    const sendChannel = new SendChannel({ window, channel, targetOrigin, spy });

    sendChannel.send(messageName, expectedPayload);

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith(
          'Error running spy',
          'Unknown error',
          expect.any(String)
        );
      },
      { timeout: WAIT_FOR_TIMEOUT }
    );
  });
});
