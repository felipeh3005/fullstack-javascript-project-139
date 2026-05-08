/* eslint-env jest */
/* eslint-disable global-require */

const loadRollbarModule = (RollbarMock) => {
  jest.resetModules();
  jest.doMock('rollbar', () => RollbarMock);

  return require('./rollbar');
};

afterEach(() => {
  delete process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN;
  delete process.env.REACT_APP_ROLLBAR_ENV;

  jest.resetModules();
  jest.dontMock('rollbar');
});

describe('rollbar', () => {
  test('exports noop rollbar client when access token is missing', () => {
    const RollbarMock = jest.fn();

    const rollbarModule = loadRollbarModule(RollbarMock);

    expect(rollbarModule.isRollbarEnabled).toBe(false);
    expect(rollbarModule.rollbarConfig).toEqual({
      accessToken: undefined,
      environment: 'test',
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    expect(RollbarMock).not.toHaveBeenCalled();

    expect(() => rollbarModule.default.error(new Error('boom'))).not.toThrow();
    expect(() => rollbarModule.default.warning('warning')).not.toThrow();
    expect(() => rollbarModule.default.info('info')).not.toThrow();
  });

  test('creates rollbar client when access token exists', () => {
    process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN = 'token-123';
    process.env.REACT_APP_ROLLBAR_ENV = 'production';

    const rollbarClient = {
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    };
    const RollbarMock = jest.fn(() => rollbarClient);

    const rollbarModule = loadRollbarModule(RollbarMock);

    expect(rollbarModule.isRollbarEnabled).toBe(true);
    expect(rollbarModule.rollbarConfig).toEqual({
      accessToken: 'token-123',
      environment: 'production',
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    expect(RollbarMock).toHaveBeenCalledWith(rollbarModule.rollbarConfig);
    expect(rollbarModule.default).toBe(rollbarClient);
  });
});
