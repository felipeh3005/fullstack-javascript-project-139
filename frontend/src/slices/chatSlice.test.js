/* eslint-env jest */

import axios from 'axios';

import reducer, {
  addChannel,
  addMessage,
  clearChatData,
  fetchChatData,
  removeChannel,
  renameChannel,
  selectChannels,
  selectCurrentChannel,
  selectCurrentChannelMessages,
  selectMessages,
  setCurrentChannelId,
} from './chatSlice';

jest.mock('axios');

const channels = [
  { id: 1, name: 'general', removable: false },
  { id: 2, name: 'random', removable: true },
];

const messages = [
  {
    id: 1,
    body: 'hello',
    channelId: 1,
    username: 'admin',
  },
  {
    id: 2,
    body: 'random message',
    channelId: 2,
    username: 'felipe',
  },
];

const buildState = () => ({
  channels,
  messages,
  currentChannelId: 1,
  loadingStatus: 'succeeded',
  error: null,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('chatSlice reducer', () => {
  test('returns the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      channels: [],
      messages: [],
      currentChannelId: null,
      loadingStatus: 'idle',
      error: null,
    });
  });

  test('sets the current channel id', () => {
    const state = reducer(buildState(), setCurrentChannelId(2));

    expect(state.currentChannelId).toBe(2);
  });

  test('adds a new message and ignores duplicated messages', () => {
    const newMessage = {
      id: 3,
      body: 'new message',
      channelId: 1,
      username: 'admin',
    };

    const stateWithNewMessage = reducer(buildState(), addMessage(newMessage));
    const stateWithDuplicate = reducer(
      stateWithNewMessage,
      addMessage(newMessage),
    );

    expect(stateWithNewMessage.messages).toHaveLength(3);
    expect(stateWithDuplicate.messages).toHaveLength(3);
  });

  test('adds a new channel and ignores duplicated channels', () => {
    const newChannel = { id: 3, name: 'support', removable: true };

    const stateWithNewChannel = reducer(buildState(), addChannel(newChannel));
    const stateWithDuplicate = reducer(
      stateWithNewChannel,
      addChannel(newChannel),
    );

    expect(stateWithNewChannel.channels).toHaveLength(3);
    expect(stateWithDuplicate.channels).toHaveLength(3);
  });

  test('removes a channel and its messages', () => {
    const state = {
      ...buildState(),
      currentChannelId: 2,
    };

    const newState = reducer(state, removeChannel({ id: 2 }));

    expect(newState.channels).toEqual([
      { id: 1, name: 'general', removable: false },
    ]);
    expect(newState.messages).toEqual([
      {
        id: 1,
        body: 'hello',
        channelId: 1,
        username: 'admin',
      },
    ]);
    expect(newState.currentChannelId).toBe(1);
  });

  test('renames a channel', () => {
    const newState = reducer(
      buildState(),
      renameChannel({ id: 2, name: 'renamed' }),
    );

    expect(newState.channels).toContainEqual({
      id: 2,
      name: 'renamed',
      removable: true,
    });
  });

  test('clears chat data', () => {
    const newState = reducer(buildState(), clearChatData());

    expect(newState).toEqual({
      channels: [],
      messages: [],
      currentChannelId: null,
      loadingStatus: 'idle',
      error: null,
    });
  });
});

describe('chatSlice extra reducers', () => {
  test('stores chat data after a successful fetch', () => {
    const payload = {
      channels,
      messages,
      currentChannelId: 1,
    };

    const newState = reducer(
      undefined,
      fetchChatData.fulfilled(payload),
    );

    expect(newState.channels).toEqual(channels);
    expect(newState.messages).toEqual(messages);
    expect(newState.currentChannelId).toBe(1);
    expect(newState.loadingStatus).toBe('succeeded');
    expect(newState.error).toBeNull();
  });

  test('stores an error after a rejected fetch', () => {
    const newState = reducer(
      undefined,
      fetchChatData.rejected(null, null, null, 401),
    );

    expect(newState.loadingStatus).toBe('failed');
    expect(newState.error).toBe(401);
  });
});

describe('chatSlice selectors', () => {
  test('selects channels and messages', () => {
    const state = { chat: buildState() };

    expect(selectChannels(state)).toEqual(channels);
    expect(selectMessages(state)).toEqual(messages);
  });

  test('selects the current channel', () => {
    const state = { chat: buildState() };

    expect(selectCurrentChannel(state)).toEqual({
      id: 1,
      name: 'general',
      removable: false,
    });
  });

  test('selects messages from the current channel', () => {
    const state = { chat: buildState() };

    expect(selectCurrentChannelMessages(state)).toEqual([
      {
        id: 1,
        body: 'hello',
        channelId: 1,
        username: 'admin',
      },
    ]);
  });
});

describe('fetchChatData thunk', () => {
  test('loads channels and messages with authorization header', async () => {
    axios.get
      .mockResolvedValueOnce({ data: channels })
      .mockResolvedValueOnce({ data: messages });

    const action = await fetchChatData('token-123')(
      jest.fn(),
      jest.fn(),
      undefined,
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      '/api/v1/channels',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      },
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      '/api/v1/messages',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      },
    );

    expect(action.type).toBe('chat/fetchChatData/fulfilled');
    expect(action.payload).toEqual({
      channels,
      messages,
      currentChannelId: 1,
    });
  });

  test('returns response status when loading chat data fails', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 401,
      },
    });

    const action = await fetchChatData('bad-token')(
      jest.fn(),
      jest.fn(),
      undefined,
    );

    expect(action.type).toBe('chat/fetchChatData/rejected');
    expect(action.payload).toBe(401);
  });
});
