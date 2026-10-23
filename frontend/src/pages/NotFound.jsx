import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty">
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
