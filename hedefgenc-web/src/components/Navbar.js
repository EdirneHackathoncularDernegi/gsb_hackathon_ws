import React from 'react';
import '../styles/navbar.css';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Admin sayfasında sadece logo ve çıkış yap butonu göster
  const isAdminPage = location.pathname === '/admin';

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={require('../assets/images/logo.PNG')} alt="Logo" />
        </Link>
      </div>
      {!isAdminPage && (
        <>
          <ul className="navbar-links">
            <li>
              <Link to="/">Ana Sayfa</Link>
            </li>
            <li>
              <Link to="/map">Etkinlik Haritası</Link>
            </li>
            <li>
              <Link to="/news">Haberler</Link>
            </li>
            {isLoggedIn && (
              <>
                <li>
                  <Link to="/career-path">Kariyer Yolu</Link>
                </li>
                <li>
                  <Link to="/courses">Kurslarım</Link>
                </li>
                <li>
                  <Link to="/soru-can">SoruCAN</Link>
                </li>
                <li>
                  <Link to="/profile">Profilim</Link>
                </li>
              </>
            )}
          </ul>
          <div className="navbar-login">
            {isLoggedIn ? (
              <button onClick={handleLogout}>Çıkış Yap</button>
            ) : (
              <Link to="/login">Giriş Yap</Link>
            )}
          </div>
        </>
      )}
      {isAdminPage && (
        <div className="navbar-admin">
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
