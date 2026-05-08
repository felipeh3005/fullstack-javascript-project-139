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
import { toast } from 'react-toastify';

import RemoveChannelModal from './RemoveChannelModal';
import { useAuth } from '../../contexts/AuthContext';
import chatReducer from '../../slices/chatSlice';

jest.mock('axios');

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options = {}) => {
      const translations = {
        'modals.removeChannel.title': 'Remove channel',
        'modals.removeChannel.body': `Are you sure you want to remove # ${options.name}?`,
        'modals.removeChannel.cancel': 'Cancel',
        'modals.removeChannel.submit': 'Remove',
        'modals.removeChannel.submitting': 'Removing...',
        'notifications.channelRemoved': 'Channel removed',
      };

      return translations[key] ?? key;
    },
  }),
}));

const removableChannel = {
  id: 2,
  name: 'random',
  removable: true,
};

const buildState = () => ({
  channels: [
    { id: 1, name: 'general', removable: false },
    removableChannel,
  ],
  messages: [
    {
      id: 1,
      body: 'hello',
      channelId: 2,
      username: 'felipe',
    },
  ],
  currentChannelId: 2,
  loadingStatus: 'succeeded',
  error: null,
});

const renderWithStore = ({
  show = true,
  channel = removableChannel,
  onHide = jest.fn(),
} = {}) => {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState: {
      chat: buildState(),
    },
  });

  render(
    <Provider store={store}>
      <RemoveChannelModal show={show} channel={channel} onHide={onHide} />
    </Provider>,
  );

  return { store, onHide };
};

beforeEach(() => {
  jest.clearAllMocks();

  useAuth.mockReturnValue({
    user: {
      token: 'token-123',
    },
  });
});

describe('RemoveChannelModal', () => {
  test('renders nothing when modal is hidden', () => {
    renderWithStore({ show: false });

    expect(screen.queryByText('Remove channel')).not.toBeInTheDocument();
  });

  test('renders nothing without selected channel', () => {
    renderWithStore({ channel: null });

    expect(screen.queryByText('Remove channel')).not.toBeInTheDocument();
  });

  test('renders selected channel removal confirmation', () => {
    renderWithStore();

    expect(screen.getByText('Remove channel')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to remove # random?'),
    ).toBeInTheDocument();
  });

  test('calls onHide when cancel button is clicked', () => {
    const { onHide } = renderWithStore();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test('removes channel, shows success toast and closes modal', async () => {
    axios.delete.mockResolvedValue({});

    const { store, onHide } = renderWithStore();

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/channels/2', {
        headers: {
          Authorization: 'Bearer token-123',
        },
      });
    });

    await waitFor(() => {
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    expect(toast.success).toHaveBeenCalledWith('Channel removed');
    expect(store.getState().chat.channels).toEqual([
      { id: 1, name: 'general', removable: false },
    ]);
  });

  test('keeps modal open when remove request fails', async () => {
    axios.delete.mockRejectedValue(new Error('Network error'));

    const { store, onHide } = renderWithStore();

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove' })).not.toBeDisabled();
    });

    expect(onHide).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(store.getState().chat.channels).toEqual([
      { id: 1, name: 'general', removable: false },
      removableChannel,
    ]);
  });
});
