import {
  Button,
  Container,
  Navbar,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { clearChatData } from '../slices/chatSlice';
import socket from '../socket';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

  const handleLogOut = () => {
    socket.disconnect();
    dispatch(clearChatData());
    logOut();
    navigate('/login');
  };

  return (
    <Navbar bg="white" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Chat
        </Navbar.Brand>

        {user && (
          <Button type="button" variant="outline-danger" onClick={handleLogOut}>
            Log out
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;