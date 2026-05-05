import axios from 'axios';
import { useState } from 'react';
import {
  Button,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../contexts/AuthContext';
import {
  addMessage,
  selectCurrentChannelId,
} from '../slices/chatSlice';

const MESSAGE_SEND_TIMEOUT = 7000;

const MessageForm = () => {
  const [body, setBody] = useState('');
  const [sendingStatus, setSendingStatus] = useState('idle');
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
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
    setError(null);

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
      setError('Message was not sent. Check your connection.');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border-top">
      <InputGroup>
        <Form.Control
          name="body"
          aria-label="New message"
          placeholder="Enter message..."
          value={body}
          disabled={isSending}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button type="submit" disabled={!body.trim() || isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </InputGroup>

      {error && (
        <div className="text-danger small mt-2">
          {error}
        </div>
      )}
    </Form>
  );
};

export default MessageForm;