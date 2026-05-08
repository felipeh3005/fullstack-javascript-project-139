/* eslint-env jest */

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import chatReducer from '../slices/chatSlice';
import socket from '../socket';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../socket', () => ({
  __esModule: true,
  default: {
    disconnect: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'app.name': 'Hexlet Chat',
        'auth.logout': 'Log out',
      };

      return translations[key] ?? key;
    },
  }),
}));

const chatState = {
  channels: [
    { id: 1, name: 'general', removable: false },
  ],
  messages: [
    {
      id: 1,
      body: 'hello',
      channelId: 1,
      username: 'admin',
    },
  ],
  currentChannelId: 1,
  loadingStatus: 'succeeded',
  error: null,
};

const renderWithStore = () => {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState: {
      chat: chatState,
    },
  });

  render(
    <Provider store={store}>
      <Header />
    </Provider>,
  );

  return store;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Header', () => {
  test('renders app name without logout button for anonymous user', () => {
    useAuth.mockReturnValue({
      user: null,
      logOut: jest.fn(),
    });
    useNavigate.mockReturnValue(jest.fn());

    renderWithStore();

    expect(screen.getByText('Hexlet Chat')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Log out' })).toBeNull();
  });

  test('logs out authenticated user', () => {
    const logOut = jest.fn();
    const navigate = jest.fn();

    useAuth.mockReturnValue({
      user: {
        username: 'felipe',
        token: 'token-123',
      },
      logOut,
    });
    useNavigate.mockReturnValue(navigate);

    const store = renderWithStore();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(logOut).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login');
    expect(store.getState().chat).toEqual({
      channels: [],
      messages: [],
      currentChannelId: null,
      loadingStatus: 'idle',
      error: null,
    });
  });
});
