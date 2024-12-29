import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} HedefGenç. Tüm hakları saklıdır.</p>
        <div className="footer-links">
          <Link to="/privacy">Gizlilik Politikası</Link>
          <Link to="/kvkk">KVKK Açık Rıza Beyanı</Link>
          <Link to="/contact">İletişim</Link><hr></hr><hr></hr><hr></hr><hr></hr><hr></hr>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
