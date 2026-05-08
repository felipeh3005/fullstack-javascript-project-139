/* eslint-disable react/function-component-definition, react/display-name */
/* eslint-env jest */
/* eslint-disable react/prop-types */

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import Channels from './Channels';
import chatReducer from '../slices/chatSlice';

jest.mock('react-bootstrap', () => {
  const actual = jest.requireActual('react-bootstrap');

  const Dropdown = ({ children }) => (
    <div>
      {children}
    </div>
  );

  Dropdown.Toggle = ({
    children,
    id,
    className,
    'aria-label': ariaLabel,
  }) => (
    <button
      type="button"
      id={id}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );

  Dropdown.Menu = ({ children }) => (
    <div>
      {children}
    </div>
  );

  Dropdown.Item = ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );

  return {
    ...actual,
    Dropdown,
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options = {}) => {
      const translations = {
        'chat.channels': 'Channels',
        'chat.addChannel': 'Add channel',
        'chat.selectChannel': `Select channel ${options.name}`,
        'chat.channelControls': 'Manage channel',
        'chat.remove': 'Remove',
        'chat.rename': 'Rename',
      };

      return translations[key] ?? key;
    },
  }),
}));

const channels = [
  { id: 1, name: 'general', removable: false },
  { id: 2, name: 'random', removable: true },
];

const buildPreloadedState = () => ({
  chat: {
    channels,
    messages: [],
    currentChannelId: 1,
    loadingStatus: 'succeeded',
    error: null,
  },
});

const renderWithStore = ({
  preloadedState = buildPreloadedState(),
  onAddChannel = jest.fn(),
  onRemoveChannel = jest.fn(),
  onRenameChannel = jest.fn(),
} = {}) => {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState,
  });

  render(
    <Provider store={store}>
      <Channels
        onAddChannel={onAddChannel}
        onRemoveChannel={onRemoveChannel}
        onRenameChannel={onRenameChannel}
      />
    </Provider>,
  );

  return {
    store,
    onAddChannel,
    onRemoveChannel,
    onRenameChannel,
  };
};

describe('Channels', () => {
  test('renders the channels list', () => {
    renderWithStore();

    expect(screen.getByText('Channels')).toBeTruthy();
    expect(screen.getByText('# general')).toBeTruthy();
    expect(screen.getByText('# random')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Manage channel' })).toBeTruthy();
  });

  test('calls add channel handler', () => {
    const { onAddChannel } = renderWithStore();

    fireEvent.click(screen.getByRole('button', { name: 'Add channel' }));

    expect(onAddChannel).toHaveBeenCalledTimes(1);
  });

  test('changes the current channel when a channel is selected', () => {
    const { store } = renderWithStore();

    fireEvent.click(screen.getByRole('button', {
      name: 'Select channel random',
    }));

    expect(store.getState().chat.currentChannelId).toBe(2);
  });

  test('calls remove and rename handlers from removable channel menu actions', () => {
    const { onRemoveChannel, onRenameChannel } = renderWithStore();

    fireEvent.click(screen.getByText('Remove'));

    expect(onRemoveChannel).toHaveBeenCalledWith({
      id: 2,
      name: 'random',
      removable: true,
    });

    fireEvent.click(screen.getByText('Rename'));

    expect(onRenameChannel).toHaveBeenCalledWith({
      id: 2,
      name: 'random',
      removable: true,
    });
  });
});
