import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>💰 Фінансовий Менеджер</h2>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Головна</Link>
          <Link to="/transactions">Транзакції</Link>
          <Link to="/budgets">Бюджети</Link>
          <Link to="/goals">Цілі</Link>
          <Link to="/profile">Профіль</Link>
        </div>
        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-balance">
            Баланс: {user?.balance?.toLocaleString('uk-UA')} ₴
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Вийти
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
