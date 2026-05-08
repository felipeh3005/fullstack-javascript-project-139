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

import AddChannelModal from './AddChannelModal';
import { useAuth } from '../../contexts/AuthContext';
import chatReducer from '../../slices/chatSlice';
import cleanProfanity from '../../utils/profanityFilter';

jest.mock('axios');

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../utils/profanityFilter', () => jest.fn((text) => text));

const buildState = () => ({
  channels: [
    { id: 1, name: 'general', removable: false },
    { id: 2, name: 'random', removable: true },
  ],
  messages: [],
  currentChannelId: 1,
  loadingStatus: 'succeeded',
  error: null,
});

const renderWithStore = ({
  show = true,
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
      <AddChannelModal show={show} onHide={onHide} />
    </Provider>,
  );

  return { store, onHide };
};

beforeEach(() => {
  jest.clearAllMocks();

  cleanProfanity.mockImplementation((text) => text);

  useAuth.mockReturnValue({
    user: {
      token: 'token-123',
    },
  });
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'modals.addChannel.title': 'Add channel',
        'modals.addChannel.label': 'Channel name',
        'modals.addChannel.cancel': 'Cancel',
        'modals.addChannel.submit': 'Add',
        'modals.addChannel.submitting': 'Adding...',
        'validation.required': 'Required',
        'validation.usernameLength': 'Must be from 3 to 20 characters',
        'validation.unique': 'Must be unique',
        'validation.networkError': 'Network error',
        'notifications.channelCreated': 'Channel created',
      };

      return translations[key] ?? key;
    },
  }),
}));

describe('AddChannelModal', () => {
  test('renders nothing when modal is hidden', () => {
    renderWithStore({ show: false });

    expect(screen.queryByText('Add channel')).not.toBeInTheDocument();
  });

  test('renders empty channel name input', () => {
    renderWithStore();

    expect(screen.getByText('Add channel')).toBeInTheDocument();
    expect(screen.getByLabelText('Channel name')).toHaveValue('');
  });

  test('calls onHide when cancel button is clicked', () => {
    const { onHide } = renderWithStore();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test('shows validation error when channel name already exists', async () => {
    renderWithStore();

    fireEvent.change(screen.getByLabelText('Channel name'), {
      target: { value: 'general' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText('Must be unique')).toBeInTheDocument();
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  test('creates channel, selects it, shows success toast and closes modal', async () => {
    cleanProfanity.mockImplementation((text) => `cleaned ${text}`);

    const serverChannel = {
      id: 3,
      name: 'cleaned dev',
      removable: true,
    };

    axios.post.mockResolvedValue({
      data: serverChannel,
    });

    const { store, onHide } = renderWithStore();

    fireEvent.change(screen.getByLabelText('Channel name'), {
      target: { value: '  dev  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/channels',
        { name: 'cleaned dev' },
        {
          headers: {
            Authorization: 'Bearer token-123',
          },
        },
      );
    });

    await waitFor(() => {
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    expect(cleanProfanity).toHaveBeenCalledWith('dev');
    expect(toast.success).toHaveBeenCalledWith('Channel created');
    expect(store.getState().chat.channels).toEqual([
      { id: 1, name: 'general', removable: false },
      { id: 2, name: 'random', removable: true },
      serverChannel,
    ]);
    expect(store.getState().chat.currentChannelId).toBe(3);
  });

  test('shows network error and keeps modal open when request fails', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    const { store, onHide } = renderWithStore();

    fireEvent.change(screen.getByLabelText('Channel name'), {
      target: { value: 'dev' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(onHide).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(store.getState().chat.channels).toEqual([
      { id: 1, name: 'general', removable: false },
      { id: 2, name: 'random', removable: true },
    ]);
    expect(store.getState().chat.currentChannelId).toBe(1);
  });
});
