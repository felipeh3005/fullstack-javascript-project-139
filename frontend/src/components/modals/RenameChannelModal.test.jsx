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

import RenameChannelModal from './RenameChannelModal';
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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'modals.renameChannel.title': 'Rename channel',
        'modals.renameChannel.label': 'Channel name',
        'modals.renameChannel.cancel': 'Cancel',
        'modals.renameChannel.submit': 'Rename',
        'modals.renameChannel.submitting': 'Renaming...',
        'validation.required': 'Required',
        'validation.usernameLength': 'Must be from 3 to 20 characters',
        'validation.unique': 'Must be unique',
        'validation.networkError': 'Network error',
        'notifications.channelRenamed': 'Channel renamed',
      };

      return translations[key] ?? key;
    },
  }),
}));

const renamedChannel = {
  id: 2,
  name: 'random',
  removable: true,
};

const buildState = () => ({
  channels: [
    { id: 1, name: 'general', removable: false },
    renamedChannel,
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
  channel = renamedChannel,
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
      <RenameChannelModal show={show} channel={channel} onHide={onHide} />
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

describe('RenameChannelModal', () => {
  test('renders nothing when modal is hidden', () => {
    renderWithStore({ show: false });

    expect(screen.queryByText('Rename channel')).not.toBeInTheDocument();
  });

  test('renders nothing without selected channel', () => {
    renderWithStore({ channel: null });

    expect(screen.queryByText('Rename channel')).not.toBeInTheDocument();
  });

  test('renders selected channel name as initial value', () => {
    renderWithStore();

    expect(screen.getByText('Rename channel')).toBeInTheDocument();
    expect(screen.getByLabelText('Channel name')).toHaveValue('random');
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

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => {
      expect(screen.getByText('Must be unique')).toBeInTheDocument();
    });

    expect(axios.patch).not.toHaveBeenCalled();
  });

  test('renames channel, shows success toast and closes modal', async () => {
    cleanProfanity.mockImplementation((text) => `cleaned ${text}`);

    axios.patch.mockResolvedValue({
      data: {
        id: 2,
        name: 'cleaned renamed',
        removable: true,
      },
    });

    const { store, onHide } = renderWithStore();

    fireEvent.change(screen.getByLabelText('Channel name'), {
      target: { value: '  renamed  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        '/api/v1/channels/2',
        { name: 'cleaned renamed' },
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

    expect(cleanProfanity).toHaveBeenCalledWith('renamed');
    expect(toast.success).toHaveBeenCalledWith('Channel renamed');
    expect(store.getState().chat.channels).toEqual([
      { id: 1, name: 'general', removable: false },
      { id: 2, name: 'cleaned renamed', removable: true },
    ]);
  });

  test('shows network error and keeps modal open when request fails', async () => {
    axios.patch.mockRejectedValue(new Error('Network error'));

    const { store, onHide } = renderWithStore();

    fireEvent.change(screen.getByLabelText('Channel name'), {
      target: { value: 'renamed' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(onHide).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(store.getState().chat.channels).toEqual([
      { id: 1, name: 'general', removable: false },
      renamedChannel,
    ]);
  });
});
