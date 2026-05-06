import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import App from './App';
import i18n from './i18n';
import reportWebVitals from './reportWebVitals';
import store from './store';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <App />
      </Provider>
    </I18nextProvider>
  </React.StrictMode>,
);

reportWebVitals();