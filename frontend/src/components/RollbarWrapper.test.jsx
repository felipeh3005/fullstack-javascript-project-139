/* eslint-env jest */
/* eslint-disable global-require, react/prop-types */

import { render, screen } from '@testing-library/react';

jest.mock('@rollbar/react', () => ({
  ErrorBoundary: ({ children, fallbackUI: FallbackUI }) => (
    <div data-testid="rollbar-error-boundary">
      <FallbackUI />
      {children}
    </div>
  ),
  Provider: ({ children, instance }) => (
    <div data-testid="rollbar-provider" data-has-instance={Boolean(instance)}>
      {children}
    </div>
  ),
}));

jest.mock('../i18n', () => ({
  __esModule: true,
  default: {
    t: (key) => {
      const translations = {
        'errors.unexpectedTitle': 'Unexpected error',
        'errors.unexpectedDescription': 'Something went wrong',
      };

      return translations[key] ?? key;
    },
  },
}));

const renderRollbarWrapper = (isRollbarEnabled) => {
  jest.resetModules();

  jest.doMock('../rollbar', () => ({
    __esModule: true,
    default: {
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
    isRollbarEnabled,
  }));

  const RollbarWrapper = require('./RollbarWrapper').default;

  render(
    <RollbarWrapper>
      <div>Application content</div>
    </RollbarWrapper>,
  );
};

describe('RollbarWrapper', () => {
  test('renders children directly when Rollbar is disabled', () => {
    renderRollbarWrapper(false);

    expect(screen.getByText('Application content')).toBeTruthy();
    expect(screen.queryByTestId('rollbar-provider')).toBeNull();
    expect(screen.queryByTestId('rollbar-error-boundary')).toBeNull();
  });

  test('wraps children with Rollbar provider and error boundary when enabled', () => {
    renderRollbarWrapper(true);

    expect(screen.getByTestId('rollbar-provider')).toBeTruthy();
    expect(screen.getByTestId('rollbar-error-boundary')).toBeTruthy();
    expect(screen.getByText('Application content')).toBeTruthy();
  });

  test('renders fallback UI through error boundary wiring', () => {
    renderRollbarWrapper(true);

    expect(screen.getByText('Unexpected error')).toBeTruthy();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });
});
