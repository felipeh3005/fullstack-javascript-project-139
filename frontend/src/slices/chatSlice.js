import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  channels: [],
  messages: [],
  currentChannelId: null,
  loadingStatus: 'idle',
  error: null,
};

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
      const currentChannelId = channels[0]?.id ?? null;

      return {
        channels,
        messages,
        currentChannelId,
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
    clearChatData: () => initialState,
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
    channels.find((channel) => channel.id === currentChannelId) ?? null
  ),
);

export const selectCurrentChannelMessages = createSelector(
  [selectMessages, selectCurrentChannelId],
  (messages, currentChannelId) => (
    messages.filter((message) => message.channelId === currentChannelId)
  ),
);

export default chatSlice.reducer;