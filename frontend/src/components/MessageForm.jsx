import { useState } from 'react';
import {
  Button,
  Form,
  InputGroup,
} from 'react-bootstrap';

const MessageForm = () => {
  const [body, setBody] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setBody('');
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border-top">
      <InputGroup>
        <Form.Control
          name="body"
          aria-label="New message"
          placeholder="Enter message..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button type="submit" disabled={!body.trim()}>
          Send
        </Button>
      </InputGroup>
    </Form>
  );
};

export default MessageForm;