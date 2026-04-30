import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="container py-5 text-center">
    <h1 className="display-4">404</h1>
    <p className="lead">Page not found</p>
    <Link to="/" className="btn btn-primary">
      Go to main page
    </Link>
  </div>
);

export default NotFoundPage;
