/* eslint-disable testing-library/no-node-access */

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import Messages from './Messages';
import chatReducer from '../slices/chatSlice';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options = {}) => {
      const translations = {
        'chat.messagesCount': `${options.count} messages`,
      };

      return translations[key] ?? key;
    },
  }),
}));

const normalizeText = (text) => text.replace(/\s+/g, ' ').trim();

const hasExactTextContent = (expectedText) => (_content, element) => (
  normalizeText(element.textContent) === expectedText
    && Array.from(element.children).every(
      (child) => normalizeText(child.textContent) !== expectedText,
    )
);

const renderWithStore = (preloadedState) => {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <Messages />
    </Provider>,
  );
};

describe('Messages', () => {
  test('renders the current channel and its messages', () => {
    renderWithStore({
      chat: {
        channels: [
          { id: 1, name: 'general', removable: false },
          { id: 2, name: 'random', removable: true },
        ],
        messages: [
          {
            id: 1,
            body: 'general message',
            channelId: 1,
            username: 'admin',
          },
          {
            id: 2,
            body: 'random message',
            channelId: 2,
            username: 'felipe',
          },
        ],
        currentChannelId: 2,
        loadingStatus: 'succeeded',
        error: null,
      },
    });

    expect(screen.getByText(hasExactTextContent('# random'))).toBeTruthy();
    expect(screen.getByText('1 messages')).toBeTruthy();
    expect(screen.getByText('felipe')).toBeTruthy();
    expect(screen.getByText(hasExactTextContent('felipe: random message'))).toBeTruthy();
    expect(screen.queryByText('admin')).toBeNull();
    expect(screen.queryByText(hasExactTextContent('admin: general message'))).toBeNull();
  });

  test('renders zero messages when the current channel has no messages', () => {
    renderWithStore({
      chat: {
        channels: [
          { id: 1, name: 'general', removable: false },
        ],
        messages: [],
        currentChannelId: 1,
        loadingStatus: 'succeeded',
        error: null,
      },
    });

    expect(screen.getByText(hasExactTextContent('# general'))).toBeTruthy();
    expect(screen.getByText('0 messages')).toBeTruthy();
  });
});
