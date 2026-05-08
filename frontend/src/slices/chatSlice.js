/* eslint-disable no-param-reassign */
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';

const getDefaultChannelId = (channels) => (
  channels.find(({ name }) => name === 'general')?.id ?? channels[0]?.id ?? null
);

const getInitialState = () => ({
  channels: [],
  messages: [],
  currentChannelId: null,
  loadingStatus: 'idle',
  error: null,
});

const initialState = getInitialState();

export const fetchChatData = createAsyncThunk(
  'chat/fetchChatData',
  async (token, { rejectWithValue }) => {
    try {
      const requestConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [channelsResponse, messagesResponse] = await Promise.all([
        axios.get('/api/v1/channels', requestConfig),
        axios.get('/api/v1/messages', requestConfig),
      ]);

      const channels = channelsResponse.data;
      const messages = messagesResponse.data;

      return {
        channels,
        messages,
        currentChannelId: getDefaultChannelId(channels),
      };
    } catch (error) {
      return rejectWithValue(error.response?.status ?? 'network');
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChannelId: (state, { payload }) => {
      state.currentChannelId = payload;
    },
    addMessage: (state, { payload }) => {
      if (!payload?.id) {
        return;
      }

      const messageAlreadyExists = state.messages.some(
        ({ id }) => String(id) === String(payload.id),
      );

      if (!messageAlreadyExists) {
        state.messages.push(payload);
      }
    },
    addChannel: (state, { payload }) => {
      if (!payload?.id) {
        return;
      }

      const channelAlreadyExists = state.channels.some(
        ({ id }) => String(id) === String(payload.id),
      );

      if (!channelAlreadyExists) {
        state.channels.push(payload);
      }
    },
    removeChannel: (state, { payload }) => {
      const removedChannelId = payload?.id;

      if (!removedChannelId) {
        return;
      }

      state.channels = state.channels.filter(
        ({ id }) => String(id) !== String(removedChannelId),
      );

      state.messages = state.messages.filter(
        ({ channelId }) => String(channelId) !== String(removedChannelId),
      );

      if (String(state.currentChannelId) === String(removedChannelId)) {
        state.currentChannelId = getDefaultChannelId(state.channels);
      }
    },
    renameChannel: (state, { payload }) => {
      if (!payload?.id) {
        return;
      }

      const channel = state.channels.find(
        ({ id }) => String(id) === String(payload.id),
      );

      if (channel) {
        channel.name = payload.name;
      }
    },
    clearChatData: () => getInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatData.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchChatData.fulfilled, (state, { payload }) => {
        state.channels = payload.channels ?? [];
        state.messages = payload.messages ?? [];
        state.currentChannelId = payload.currentChannelId ?? null;
        state.loadingStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchChatData.rejected, (state, { payload }) => {
        state.loadingStatus = 'failed';
        state.error = payload;
      });
  },
});

export const {
  setCurrentChannelId,
  addMessage,
  addChannel,
  removeChannel,
  renameChannel,
  clearChatData,
} = chatSlice.actions;

export const selectChannels = (state) => state.chat.channels;
export const selectMessages = (state) => state.chat.messages;
export const selectCurrentChannelId = (state) => state.chat.currentChannelId;
export const selectLoadingStatus = (state) => state.chat.loadingStatus;
export const selectChatError = (state) => state.chat.error;

export const selectCurrentChannel = createSelector(
  [selectChannels, selectCurrentChannelId],
  (channels, currentChannelId) => (
    channels.find(({ id }) => String(id) === String(currentChannelId)) ?? null
  ),
);

export const selectCurrentChannelMessages = createSelector(
  [selectMessages, selectCurrentChannelId],
  (messages, currentChannelId) => {
    if (currentChannelId === null || currentChannelId === undefined) {
      return [];
    }

    return messages.filter(
      ({ channelId }) => String(channelId) === String(currentChannelId),
    );
  },
);

export default chatSlice.reducer;
