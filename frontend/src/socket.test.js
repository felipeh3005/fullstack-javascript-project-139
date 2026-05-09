/* eslint-env jest */
/* eslint-disable global-require */

const loadSocketModule = (ioMock) => {
  jest.resetModules();
  jest.doMock('socket.io-client', () => ({
    io: ioMock,
  }));

  return require('./socket').default;
};

afterEach(() => {
  jest.resetModules();
  jest.dontMock('socket.io-client');
});

describe('socket', () => {
  test('creates socket client with autoConnect disabled', () => {
    const socketClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      connected: false,
    };
    const ioMock = jest.fn(() => socketClient);

    const socket = loadSocketModule(ioMock);

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith({
      autoConnect: false,
    });
    expect(socket).toBe(socketClient);
  });
});
