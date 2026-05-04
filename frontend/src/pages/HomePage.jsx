import {
  Button,
  Card,
  Container,
} from 'react-bootstrap';

import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, logOut } = useAuth();

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h1 className="mb-3">Hexlet Chat</h1>
              <p className="lead mb-4">
                Welcome, {user?.username}. The chat will be here soon.
              </p>
              <Button type="button" variant="outline-danger" onClick={logOut}>
                Log out
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default HomePage;