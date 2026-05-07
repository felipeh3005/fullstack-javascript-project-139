import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react';

import i18n from '../i18n';
import rollbar, { isRollbarEnabled } from '../rollbar';

const ErrorFallback = () => (
  <main className="container py-5">
    <div className="alert alert-danger" role="alert">
      <h1 className="h4">{i18n.t('errors.unexpectedTitle')}</h1>
      <p className="mb-0">{i18n.t('errors.unexpectedDescription')}</p>
    </div>
  </main>
);

const RollbarWrapper = ({ children }) => {
  if (!isRollbarEnabled) {
    return children;
  }

  return (
    <RollbarProvider instance={rollbar}>
      <ErrorBoundary fallbackUI={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </RollbarProvider>
  );
};

export default RollbarWrapper;