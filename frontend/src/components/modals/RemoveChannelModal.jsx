import axios from 'axios';
import { useState } from 'react';
import {
  Button,
  Modal,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { useAuth } from '../../contexts/AuthContext';
import { removeChannel } from '../../slices/chatSlice';

const RemoveChannelModal = ({ show, channel, onHide }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();
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
      toast.success(t('notifications.channelRemoved'));
      setIsSubmitting(false);
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
        <Modal.Title>{t('modals.removeChannel.title')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0">
          {t('modals.removeChannel.body', { name: channel.name })}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onHide}
        >
          {t('modals.removeChannel.cancel')}
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={isSubmitting}
          onClick={handleRemove}
        >
          {isSubmitting
            ? t('modals.removeChannel.submitting')
            : t('modals.removeChannel.submit')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveChannelModal;
