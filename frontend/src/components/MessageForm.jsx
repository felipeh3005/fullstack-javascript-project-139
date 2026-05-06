import axios from 'axios';
import { useState } from 'react';
import {
  Button,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../contexts/AuthContext';
import {
  addMessage,
  selectCurrentChannelId,
} from '../slices/chatSlice';

const MESSAGE_SEND_TIMEOUT = 7000;

const MessageForm = () => {
  const [body, setBody] = useState('');
  const [hasError, setHasError] = useState(false);
  const [sendingStatus, setSendingStatus] = useState('idle');

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentChannelId = useSelector(selectCurrentChannelId);
  const { user } = useAuth();

  const isSending = sendingStatus === 'sending';

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody || !currentChannelId || isSending) {
      return;
    }

    const message = {
      body: trimmedBody,
      channelId: currentChannelId,
      username: user.username,
    };

    setSendingStatus('sending');
    setHasError(false);

    try {
      const response = await axios.post('/api/v1/messages', message, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        timeout: MESSAGE_SEND_TIMEOUT,
      });

      dispatch(addMessage(response.data));
      setBody('');
      setSendingStatus('idle');
    } catch {
      setSendingStatus('failed');
      setHasError(true);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border-top">
      <InputGroup>
        <Form.Control
          name="body"
          aria-label={t('messageForm.newMessage')}
          placeholder={t('messageForm.placeholder')}
          value={body}
          disabled={isSending}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button type="submit" disabled={!body.trim() || isSending}>
          {isSending ? t('messageForm.sending') : t('messageForm.send')}
        </Button>
      </InputGroup>

      {hasError && (
        <div className="text-danger small mt-2">
          {t('messageForm.sendError')}
        </div>
      )}
    </Form>
  );
};

export default MessageForm;