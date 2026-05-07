import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import './index.css';
import App from './App';
import i18n from './i18n';
import reportWebVitals from './reportWebVitals';
import store from './store';
import RollbarWrapper from './components/RollbarWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <RollbarWrapper>
        <Provider store={store}>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Provider>
      </RollbarWrapper>
    </I18nextProvider>
  </React.StrictMode>,
);

reportWebVitals();