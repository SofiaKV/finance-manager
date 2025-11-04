import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';
import { Button } from './ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: 'Головна' },
      { to: '/transactions', label: 'Транзакції' },
      { to: '/budgets', label: 'Бюджети' },
      { to: '/goals', label: 'Цілі' },
      { to: '/profile', label: 'Профіль' },
    ],
    [],
  );

  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((i) =>
      location.pathname === '/'
        ? i.to === '/dashboard'
        : location.pathname.startsWith(i.to),
    );
    return idx === -1 ? 0 : idx;
  }, [location.pathname, navItems]);

  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const update = () => {
      const el = linkRefs.current[activeIndex];
      const container = containerRef.current;
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        setIndicator({ left: elRect.left - cRect.left, width: elRect.width });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeIndex, navItems.length]);

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
        <div className="nav-links sliding-nav" ref={containerRef}>
          <div
            className="nav-indicator"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
            }}
          />
          {navItems.map((item, idx) => (
            <Link
              key={item.to}
              to={item.to}
              ref={(el) => {
                linkRefs.current[idx] = el;
              }}
              className={idx === activeIndex ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-balance">
            Баланс: {user?.balance?.toLocaleString('uk-UA')} ₴
          </span>
          <Button onClick={handleLogout} size="sm">
            Вийти
          </Button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
