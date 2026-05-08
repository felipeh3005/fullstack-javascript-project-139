/* eslint-disable react/function-component-definition, react/display-name */
/* eslint-env jest */
/* eslint-disable global-require, react/display-name */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
  addChannel,
  addMessage,
  clearChatData,
  fetchChatData,
  removeChannel,
  renameChannel,
} from '../slices/chatSlice';
import socket from '../socket';
import { useAuth } from '../contexts/AuthContext';
import HomePage from './HomePage';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../socket', () => ({
  connected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock('../slices/chatSlice', () => ({
  addChannel: jest.fn((payload) => ({
    type: 'chat/addChannel',
    payload,
  })),
  addMessage: jest.fn((payload) => ({
    type: 'chat/addMessage',
    payload,
  })),
  clearChatData: jest.fn(() => ({
    type: 'chat/clearChatData',
  })),
  fetchChatData: jest.fn((token) => ({
    type: 'chat/fetchChatData',
    payload: token,
  })),
  removeChannel: jest.fn((payload) => ({
    type: 'chat/removeChannel',
    payload,
  })),
  renameChannel: jest.fn((payload) => ({
    type: 'chat/renameChannel',
    payload,
  })),
  selectChatError: (state) => state.chat.error,
  selectLoadingStatus: (state) => state.chat.loadingStatus,
}));

jest.mock('../components/Channels', () => {
  const React = require('react');

  return ({ onAddChannel, onRemoveChannel, onRenameChannel }) => React.createElement(
    'div',
    { 'data-testid': 'channels-component' },
    React.createElement('p', null, 'channels component'),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: onAddChannel,
      },
      'open add modal',
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: () => onRemoveChannel({ id: 2, name: 'random', removable: true }),
      },
      'open remove modal',
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: () => onRenameChannel({ id: 2, name: 'random', removable: true }),
      },
      'open rename modal',
    ),
  );
});

jest.mock('../components/Messages', () => {
  const React = require('react');

  return () => React.createElement(
    'div',
    { 'data-testid': 'messages-component' },
    'messages component',
  );
});

jest.mock('../components/MessageForm', () => {
  const React = require('react');

  return () => React.createElement(
    'div',
    { 'data-testid': 'message-form-component' },
    'message form component',
  );
});

jest.mock('../components/modals/AddChannelModal', () => {
  const React = require('react');

  return ({ show, onHide }) => {
    if (!show) {
      return null;
    }

    return React.createElement(
      'div',
      { 'data-testid': 'add-channel-modal' },
      React.createElement('p', null, 'add channel modal'),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: onHide,
        },
        'close add channel modal',
      ),
    );
  };
});

jest.mock('../components/modals/RemoveChannelModal', () => {
  const React = require('react');

  return ({ show, channel, onHide }) => {
    if (!show) {
      return null;
    }

    return React.createElement(
      'div',
      { 'data-testid': 'remove-channel-modal' },
      React.createElement('p', null, `remove channel modal ${channel.name}`),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: onHide,
        },
        'close remove channel modal',
      ),
    );
  };
});

jest.mock('../components/modals/RenameChannelModal', () => {
  const React = require('react');

  return ({ show, channel, onHide }) => {
    if (!show) {
      return null;
    }

    return React.createElement(
      'div',
      { 'data-testid': 'rename-channel-modal' },
      React.createElement('p', null, `rename channel modal ${channel.name}`),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: onHide,
        },
        'close rename channel modal',
      ),
    );
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'chat.loading': 'Loading...',
        'chat.loadError': 'Failed to load chat data. Try again later.',
        'notifications.dataLoadError': 'Failed to load chat data.',
      };

      return translations[key] ?? key;
    },
  }),
}));

const defaultUser = {
  username: 'felipe',
  token: 'token-123',
};

const createState = ({ loadingStatus, error }) => ({
  chat: {
    loadingStatus,
    error,
  },
});

const renderHomePage = ({
  loadingStatus = 'succeeded',
  error = null,
  user = defaultUser,
} = {}) => {
  const dispatch = jest.fn();
  const logOut = jest.fn();
  const state = createState({ loadingStatus, error });

  useDispatch.mockReturnValue(dispatch);
  useAuth.mockReturnValue({
    user,
    logOut,
  });
  useSelector.mockImplementation((selector) => selector(state));

  const view = render(<HomePage />);

  return {
    ...view,
    dispatch,
    logOut,
  };
};

const getSocketHandler = (eventName) => {
  const socketCall = socket.on.mock.calls.find(([name]) => name === eventName);

  return socketCall[1];
};

beforeEach(() => {
  jest.clearAllMocks();
  socket.connected = false;

  addChannel.mockImplementation((payload) => ({
    type: 'chat/addChannel',
    payload,
  }));

  addMessage.mockImplementation((payload) => ({
    type: 'chat/addMessage',
    payload,
  }));

  clearChatData.mockImplementation(() => ({
    type: 'chat/clearChatData',
  }));

  fetchChatData.mockImplementation((token) => ({
    type: 'chat/fetchChatData',
    payload: token,
  }));

  removeChannel.mockImplementation((payload) => ({
    type: 'chat/removeChannel',
    payload,
  }));

  renameChannel.mockImplementation((payload) => ({
    type: 'chat/renameChannel',
    payload,
  }));
});

describe('HomePage', () => {
  test('shows loading state while chat data is loading', () => {
    renderHomePage({ loadingStatus: 'loading' });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('channels-component')).not.toBeInTheDocument();
  });

  test('fetches chat data when status is idle and user has token', async () => {
    const { dispatch } = renderHomePage({ loadingStatus: 'idle' });

    await waitFor(() => {
      expect(fetchChatData).toHaveBeenCalledWith('token-123');
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'chat/fetchChatData',
      payload: 'token-123',
    });
  });

  test('does not fetch chat data when user has no token', () => {
    const { dispatch } = renderHomePage({
      loadingStatus: 'idle',
      user: null,
    });

    expect(fetchChatData).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('shows load error when chat data request fails', () => {
    renderHomePage({
      loadingStatus: 'failed',
      error: 500,
    });

    expect(
      screen.getByText('Failed to load chat data. Try again later.'),
    ).toBeInTheDocument();
  });

  test('logs out and clears chat data when server returns unauthorized error', async () => {
    const { dispatch, logOut } = renderHomePage({
      loadingStatus: 'failed',
      error: 401,
    });

    await waitFor(() => {
      expect(clearChatData).toHaveBeenCalledTimes(1);
    });

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'chat/clearChatData',
    });
    expect(logOut).toHaveBeenCalledTimes(1);
  });

  test('shows toast when chat data request fails with non-auth error', async () => {
    renderHomePage({
      loadingStatus: 'failed',
      error: 500,
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load chat data.',
        {
          toastId: 'chat-data-load-error',
        },
      );
    });
  });

  test('renders chat layout when chat data is loaded', () => {
    renderHomePage();

    expect(screen.getByTestId('channels-component')).toBeInTheDocument();
    expect(screen.getByTestId('messages-component')).toBeInTheDocument();
    expect(screen.getByTestId('message-form-component')).toBeInTheDocument();
  });

  test('opens and closes add channel modal', () => {
    renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: 'open add modal' }));

    expect(screen.getByTestId('add-channel-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close add channel modal' }));

    expect(screen.queryByTestId('add-channel-modal')).not.toBeInTheDocument();
  });

  test('opens and closes remove channel modal', () => {
    renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: 'open remove modal' }));

    expect(screen.getByText('remove channel modal random')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close remove channel modal' }));

    expect(screen.queryByTestId('remove-channel-modal')).not.toBeInTheDocument();
  });

  test('opens and closes rename channel modal', () => {
    renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: 'open rename modal' }));

    expect(screen.getByText('rename channel modal random')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close rename channel modal' }));

    expect(screen.queryByTestId('rename-channel-modal')).not.toBeInTheDocument();
  });

  test('connects socket and registers event listeners when chat data is loaded', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(socket.on).toHaveBeenCalledTimes(4);
    });

    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledWith('newMessage', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('newChannel', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('removeChannel', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('renameChannel', expect.any(Function));
  });

  test('does not reconnect socket when it is already connected', async () => {
    socket.connected = true;

    renderHomePage();

    await waitFor(() => {
      expect(socket.on).toHaveBeenCalledTimes(4);
    });

    expect(socket.connect).not.toHaveBeenCalled();
  });

  test('dispatches chat actions from socket events', async () => {
    const { dispatch } = renderHomePage();

    await waitFor(() => {
      expect(socket.on).toHaveBeenCalledTimes(4);
    });

    const message = {
      id: 10,
      body: 'hello',
      channelId: 1,
      username: 'felipe',
    };
    const channel = {
      id: 3,
      name: 'frontend',
      removable: true,
    };
    const renamedChannel = {
      id: 3,
      name: 'react',
      removable: true,
    };

    act(() => {
      getSocketHandler('newMessage')(message);
      getSocketHandler('newChannel')(channel);
      getSocketHandler('removeChannel')(channel);
      getSocketHandler('renameChannel')(renamedChannel);
    });

    expect(addMessage).toHaveBeenCalledWith(message);
    expect(addChannel).toHaveBeenCalledWith(channel);
    expect(removeChannel).toHaveBeenCalledWith(channel);
    expect(renameChannel).toHaveBeenCalledWith(renamedChannel);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'chat/addMessage',
      payload: message,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'chat/addChannel',
      payload: channel,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'chat/removeChannel',
      payload: channel,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'chat/renameChannel',
      payload: renamedChannel,
    });
  });

  test('removes socket listeners on unmount', async () => {
    const { unmount } = renderHomePage();

    await waitFor(() => {
      expect(socket.on).toHaveBeenCalledTimes(4);
    });

    const handlers = Object.fromEntries(socket.on.mock.calls);

    unmount();

    expect(socket.off).toHaveBeenCalledWith('newMessage', handlers.newMessage);
    expect(socket.off).toHaveBeenCalledWith('newChannel', handlers.newChannel);
    expect(socket.off).toHaveBeenCalledWith('removeChannel', handlers.removeChannel);
    expect(socket.off).toHaveBeenCalledWith('renameChannel', handlers.renameChannel);
  });
});
