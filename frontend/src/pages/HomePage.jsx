import { useEffect } from 'react';
import {
  Alert,
  Button,
  Spinner,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import Channels from '../components/Channels';
import MessageForm from '../components/MessageForm';
import Messages from '../components/Messages';
import { useAuth } from '../contexts/AuthContext';
import {
  clearChatData,
  fetchChatData,
  selectChatError,
  selectLoadingStatus,
} from '../slices/chatSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user, logOut } = useAuth();
  const loadingStatus = useSelector(selectLoadingStatus);
  const error = useSelector(selectChatError);

  useEffect(() => {
    if (user?.token && loadingStatus === 'idle') {
      dispatch(fetchChatData(user.token));
    }
  }, [dispatch, user?.token, loadingStatus]);

  useEffect(() => {
    if (loadingStatus === 'failed' && error === 401) {
      logOut();
      dispatch(clearChatData());
    }
  }, [dispatch, error, loadingStatus, logOut]);

  const handleLogOut = () => {
    dispatch(clearChatData());
    logOut();
  };

  if (loadingStatus === 'loading' || loadingStatus === 'idle') {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (loadingStatus === 'failed') {
    return (
      <div className="container py-5">
        <Alert variant="danger">
          Could not load chat data.
        </Alert>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex flex-column">
      <header className="navbar navbar-light bg-white border-bottom px-4">
        <span className="navbar-brand mb-0 h1">Hexlet Chat</span>
        <Button type="button" variant="outline-danger" onClick={handleLogOut}>
          Log out
        </Button>
      </header>

      <main className="container h-100 my-4 overflow-hidden rounded shadow-sm border">
        <div className="row h-100">
          <aside className="col-4 col-md-3 h-100 p-0">
            <Channels />
          </aside>

          <section className="col h-100 p-0 d-flex flex-column">
            <Messages />
            <MessageForm />
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;