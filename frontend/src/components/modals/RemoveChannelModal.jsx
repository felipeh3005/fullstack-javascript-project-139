import axios from 'axios';
import { useState } from 'react';
import {
  Button,
  Modal,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { useAuth } from '../../contexts/AuthContext';
import { removeChannel } from '../../slices/chatSlice';

const RemoveChannelModal = ({ show, channel, onHide }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { user } = useAuth();

  if (!show || !channel) {
    return null;
  }

  const handleRemove = async () => {
    setIsSubmitting(true);

    try {
      await axios.delete(`/api/v1/channels/${channel.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      dispatch(removeChannel({ id: channel.id }));
      onHide();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      centered
      onHide={isSubmitting ? undefined : onHide}
      backdrop={isSubmitting ? 'static' : true}
      keyboard={!isSubmitting}
    >
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>Remove channel</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0">
          Remove channel
          {' '}
          <b>
            #
            {' '}
            {channel.name}
          </b>
          ?
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={isSubmitting}
          onClick={handleRemove}
        >
          {isSubmitting ? 'Removing...' : 'Remove'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveChannelModal;