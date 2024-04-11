// import * as reactRouterDOMMOdule from 'react-router-dom';
import { NavigateFunction, NavigateOptions, To } from 'react-router-dom';
import KBaseUIConnection, { channelSpy } from './KBaseUIConnection';
import { KBaseUINavigatedPayload } from './messageValidation';
import { ChannelMessage } from './SendChannel';

describe('KBaseUIConnection class', () => {
  let infoLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
    infoLogSpy = jest.spyOn(console, 'info');
  });

  test('can be constructed from nonsense params', () => {
    const connection = new KBaseUIConnection({
      kbaseUIOrigin: 'http://example.com',
      kbaseUIWindow: window,
      receiveChannelId: 'abc',
      sendChannelId: 'def',
    });

    expect(connection).toBeInstanceOf(KBaseUIConnection);
  });

  test('handles legacy navigation message well', () => {
    const connection = new KBaseUIConnection({
      kbaseUIOrigin: 'http://example.com',
      kbaseUIWindow: window,
      receiveChannelId: 'abc',
      sendChannelId: 'def',
    });

    const payload: KBaseUINavigatedPayload = {
      path: 'foo',
      params: { bar: 'baz' },
      type: 'kbaseui',
    };

    let navigateCalled = false;
    let navigateCalledToArg: To | number | null = null;
    let navigateCalledOptionsArg: NavigateOptions | null = null;
    const navigate: NavigateFunction = (
      to: To | number, // gnarly
      options?: NavigateOptions
    ) => {
      navigateCalled = true;
      navigateCalledToArg = to;
      navigateCalledOptionsArg = options || null;
    };

    connection.handleNavigationMessage(payload, navigate);

    expect(navigateCalled).toBe(true);
    expect(navigateCalledToArg).not.toBeNull();
    expect(navigateCalledToArg).toMatchObject({
      pathname: '/legacy/foo',
      search: 'bar=baz',
    });
    expect(navigateCalledOptionsArg).not.toBeNull();
    expect(navigateCalledOptionsArg).toMatchObject({ replace: true });
  });

  test('handles Europa navigation message well', () => {
    const connection = new KBaseUIConnection({
      kbaseUIOrigin: 'http://example.com',
      kbaseUIWindow: window,
      receiveChannelId: 'abc',
      sendChannelId: 'def',
    });

    const payload: KBaseUINavigatedPayload = {
      path: 'foo',
      params: { bar: 'baz' },
      type: 'europaui',
    };

    let navigateCalled = false;
    let navigateCalledToArg: To | number | null = null;
    let navigateCalledOptionsArg: NavigateOptions | null = null;
    const navigate: NavigateFunction = (
      to: To | number, // gnarly
      options?: NavigateOptions
    ) => {
      navigateCalled = true;
      navigateCalledToArg = to;
      navigateCalledOptionsArg = options || null;
    };

    connection.handleNavigationMessage(payload, navigate);

    expect(navigateCalled).toBe(true);
    expect(navigateCalledToArg).not.toBeNull();
    expect(navigateCalledToArg).toMatchObject({
      pathname: '/foo',
      search: 'bar=baz',
    });
    expect(navigateCalledOptionsArg).not.toBeNull();
    expect(navigateCalledOptionsArg).toMatchObject({ replace: true });
  });

  test('channelSpy spits to the console', () => {
    const message: ChannelMessage = new ChannelMessage({
      name: 'foo',
      envelope: { channel: 'bar', id: 'baz' },
      payload: 'fuzz',
    });

    channelSpy('DIRECTION', message);

    expect(infoLogSpy).toHaveBeenCalledWith(
      '[KBaseUIConnection][spy][DIRECTION]',
      message.envelope.channel,
      message.name
    );
  });
});
