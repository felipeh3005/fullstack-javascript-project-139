import { useSelector } from 'react-redux';

import {
  selectCurrentChannel,
  selectCurrentChannelMessages,
} from '../slices/chatSlice';

const Messages = () => {
  const currentChannel = useSelector(selectCurrentChannel);
  const messages = useSelector(selectCurrentChannelMessages) ?? [];

  return (
    <div className="d-flex flex-column h-100">
      <div className="p-3 border-bottom bg-light">
        <h2 className="h5 mb-1">
          #
          {currentChannel?.name ?? 'channel'}
        </h2>
        <span className="text-muted">
          {messages.length}
          {' '}
          messages
        </span>
      </div>

      <div className="flex-grow-1 p-3 overflow-auto">
        {messages.length === 0 ? (
          <p className="text-muted mb-0">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-2">
              <b>{message.username}</b>
              {': '}
              <span>{message.body}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;