import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import {
  selectCurrentChannel,
  selectCurrentChannelMessages,
} from '../slices/chatSlice';

const Messages = () => {
  const { t } = useTranslation();
  const currentChannel = useSelector(selectCurrentChannel);
  const messages = useSelector(selectCurrentChannelMessages) ?? [];

  return (
    <div className="d-flex flex-column flex-grow-1 overflow-hidden">
      <div className="p-3 border-bottom">
        <p className="m-0 fw-bold">
          #
          {' '}
          {currentChannel?.name ?? ''}
        </p>
        <span className="text-muted small">
          {t('chat.messagesCount', { count: messages.length })}
        </span>
      </div>

      <div className="overflow-auto px-4 py-3 h-100">
        {messages.map((message) => (
          <div key={message.id} className="mb-2 text-break">
            <b>{message.username}</b>
            :
            {' '}
            {message.body}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
