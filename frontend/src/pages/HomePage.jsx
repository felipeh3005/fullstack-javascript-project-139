import { useEffect, useState } from 'react';
import {
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Channels from '../components/Channels';
import MessageForm from '../components/MessageForm';
import Messages from '../components/Messages';
import AddChannelModal from '../components/modals/AddChannelModal';
import RemoveChannelModal from '../components/modals/RemoveChannelModal';
import RenameChannelModal from '../components/modals/RenameChannelModal';
import { useAuth } from '../contexts/AuthContext';
import {
  addChannel,
  addMessage,
  clearChatData,
  fetchChatData,
  removeChannel,
  renameChannel,
  selectChatError,
  selectLoadingStatus,
} from '../slices/chatSlice';
import socket from '../socket';

const initialModalInfo = {
  type: null,
  channel: null,
};

const HomePage = () => {
  const [modalInfo, setModalInfo] = useState(initialModalInfo);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, logOut } = useAuth();
  const loadingStatus = useSelector(selectLoadingStatus);
  const error = useSelector(selectChatError);

  useEffect(() => {
    if (user?.token && loadingStatus === 'idle') {
      dispatch(fetchChatData(user.token));
    }
  }, [dispatch, user?.token, loadingStatus]);

  useEffect(() => {
    if (loadingStatus !== 'succeeded') {
      return undefined;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleNewMessage = (message) => {
      dispatch(addMessage(message));
    };

    const handleNewChannel = (channel) => {
      dispatch(addChannel(channel));
    };

    const handleRemoveChannel = (channel) => {
      dispatch(removeChannel(channel));
    };

    const handleRenameChannel = (channel) => {
      dispatch(renameChannel(channel));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('newChannel', handleNewChannel);
    socket.on('removeChannel', handleRemoveChannel);
    socket.on('renameChannel', handleRenameChannel);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newChannel', handleNewChannel);
      socket.off('removeChannel', handleRemoveChannel);
      socket.off('renameChannel', handleRenameChannel);
    };
  }, [dispatch, loadingStatus]);

  useEffect(() => {
    if (loadingStatus === 'failed' && error === 401) {
      socket.disconnect();
      dispatch(clearChatData());
      logOut();
    }
  }, [dispatch, error, loadingStatus, logOut]);

  useEffect(() => {
    if (loadingStatus === 'failed' && error !== 401) {
      toast.error(t('notifications.dataLoadError'), {
        toastId: 'chat-data-load-error',
      });
    }
  }, [error, loadingStatus, t]);

  const closeModal = () => {
    setModalInfo(initialModalInfo);
  };

  if (loadingStatus === 'loading' || loadingStatus === 'idle') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 57px)' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('chat.loading')}</span>
        </Spinner>
      </div>
    );
  }

  if (loadingStatus === 'failed') {
    return (
      <div className="container py-5">
        <Alert variant="danger">
          {t('chat.loadError')}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <main className="container my-4 overflow-hidden rounded shadow-sm border" style={{ height: 'calc(100vh - 105px)' }}>
        <div className="row h-100">
          <aside className="col-4 col-md-3 h-100 p-0">
            <Channels
              onAddChannel={() => setModalInfo({ type: 'adding', channel: null })}
              onRemoveChannel={(channel) => setModalInfo({ type: 'removing', channel })}
              onRenameChannel={(channel) => setModalInfo({ type: 'renaming', channel })}
            />
          </aside>

          <section className="col h-100 p-0 d-flex flex-column">
            <Messages />
            <MessageForm />
          </section>
        </div>
      </main>

      <AddChannelModal
        show={modalInfo.type === 'adding'}
        onHide={closeModal}
      />

      <RenameChannelModal
        show={modalInfo.type === 'renaming'}
        channel={modalInfo.channel}
        onHide={closeModal}
      />

      <RemoveChannelModal
        show={modalInfo.type === 'removing'}
        channel={modalInfo.channel}
        onHide={closeModal}
      />
    </>
  );
};

export default HomePage;