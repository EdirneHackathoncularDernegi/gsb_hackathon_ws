import React from 'react';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <ul className="navbar-links">
        <li><a href="/">Ana Sayfa</a></li>
        <li><a href="/map">Etkinlik Haritası</a></li>
        <li><a href="/about">Hakkında</a></li>
      </ul>
      <div className="navbar-login">
        <button>Giriş Yap</button>
      </div>
    </nav>
  );
};

export default Navbar;
