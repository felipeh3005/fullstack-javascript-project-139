/* eslint-env jest */

import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';

import MessageForm from './MessageForm';
import { useAuth } from '../contexts/AuthContext';
import chatReducer from '../slices/chatSlice';
import cleanProfanity from '../utils/profanityFilter';

jest.mock('axios');

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../utils/profanityFilter', () => ({
  __esModule: true,
  default: jest.fn((text) => `cleaned ${text}`),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'messageForm.newMessage': 'New message',
        'messageForm.placeholder': 'Enter message...',
        'messageForm.send': 'Send',
        'messageForm.sending': 'Sending...',
        'messageForm.sendError': 'Message was not sent',
      };

      return translations[key] ?? key;
    },
  }),
}));

const buildState = (currentChannelId = 1) => ({
  channels: [
    { id: 1, name: 'general', removable: false },
  ],
  messages: [],
  currentChannelId,
  loadingStatus: 'succeeded',
  error: null,
});

const setupWithStore = (currentChannelId = 1) => {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState: {
      chat: buildState(currentChannelId),
    },
  });

  render(
    <Provider store={store}>
      <MessageForm />
    </Provider>,
  );

  return store;
};

beforeEach(() => {
  jest.clearAllMocks();

  cleanProfanity.mockImplementation((text) => `cleaned ${text}`);

  useAuth.mockReturnValue({
    user: {
      username: 'felipe',
      token: 'token-123',
    },
  });
});

describe('MessageForm', () => {
  test('renders empty form with disabled submit button', () => {
    setupWithStore();

    expect(screen.getByLabelText('New message')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('sends cleaned trimmed message and stores server response', async () => {
    const serverMessage = {
      id: 10,
      body: 'cleaned hello world',
      channelId: 1,
      username: 'felipe',
    };

    axios.post.mockResolvedValue({ data: serverMessage });

    const appStore = setupWithStore();

    fireEvent.change(screen.getByLabelText('New message'), {
      target: { value: '  hello world  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/messages',
        {
          body: 'cleaned hello world',
          channelId: 1,
          username: 'felipe',
        },
        {
          headers: {
            Authorization: 'Bearer token-123',
          },
          timeout: 7000,
        },
      );
    });

    expect(cleanProfanity).toHaveBeenCalledWith('hello world');
    await waitFor(() => {
      expect(screen.getByLabelText('New message')).toHaveValue('');
    });
    expect(appStore.getState().chat.messages).toEqual([serverMessage]);
  });

  test('does not send message without current channel', () => {
    setupWithStore(null);

    fireEvent.change(screen.getByLabelText('New message'), {
      target: { value: 'hello' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(cleanProfanity).not.toHaveBeenCalled();
  });

  test('shows error when message request fails', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    setupWithStore();

    fireEvent.change(screen.getByLabelText('New message'), {
      target: { value: 'hello' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('Message was not sent')).toBeTruthy();
    });

    expect(screen.getByLabelText('New message')).toHaveValue('hello');
    expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled();
  });
});
