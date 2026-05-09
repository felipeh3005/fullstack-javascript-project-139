/* eslint-env jest */

import { setCurrentChannelId } from '../slices/chatSlice';
import store from './index';

describe('store', () => {
  test('configures the chat reducer', () => {
    expect(store.getState()).toHaveProperty('chat');

    store.dispatch(setCurrentChannelId(123));

    expect(store.getState().chat.currentChannelId).toBe(123);
  });
});
