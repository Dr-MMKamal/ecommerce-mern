import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { selectCartCount } from '../features/cart/cartSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector(selectCartCount);
  const [keyword, setKeyword] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/shop?keyword=${encodeURIComponent(keyword.trim())}` : '/shop');
  };

  const onLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          Shop<span>Hub</span>
        </Link>

        <form className="search" onSubmit={onSearch}>
          <input
            placeholder="Search products…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>

        <nav className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart">Cart{cartCount > 0 && <span className="badge">{cartCount}</span>}</NavLink>
          {user ? (
            <div className="dropdown">
              <button className="link-btn">{user.name.split(' ')[0]} ▾</button>
              <div className="dropdown-menu">
                <Link to="/profile">Profile</Link>
                <Link to="/orders">My orders</Link>
                {user.role === 'admin' && <Link to="/admin">Admin dashboard</Link>}
                <button onClick={onLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <NavLink to="/login">Sign in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
