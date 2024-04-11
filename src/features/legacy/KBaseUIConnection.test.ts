import KBaseUIConnection from './KBaseUIConnection';

describe('KBaseUIConnection class', () => {
  test('Can be constructed from nonsense params', () => {
    const connection = new KBaseUIConnection({
      kbaseUIOrigin: 'http://example.com',
      kbaseUIWindow: window,
      receiveChannelId: 'abc',
      sendChannelId: 'def',
    });

    expect(connection).toBeInstanceOf(KBaseUIConnection);
  });
});
