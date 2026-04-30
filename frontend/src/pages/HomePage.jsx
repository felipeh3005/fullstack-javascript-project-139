import { Link } from 'react-router-dom';

const HomePage = () => (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <h1 className="mb-4">Hexlet Chat</h1>
        <p className="lead">
          Welcome to the chat application.
        </p>
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    </div>
  </div>
);

export default HomePage;
