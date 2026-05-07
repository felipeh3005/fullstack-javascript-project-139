import Rollbar from 'rollbar';

const accessToken = process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN;

export const isRollbarEnabled = Boolean(accessToken);

export const rollbarConfig = {
  accessToken,
  environment: process.env.REACT_APP_ROLLBAR_ENV || process.env.NODE_ENV || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
};

const noop = () => {};

const rollbar = isRollbarEnabled
  ? new Rollbar(rollbarConfig)
  : {
      error: noop,
      warning: noop,
      info: noop,
    };

export default rollbar;