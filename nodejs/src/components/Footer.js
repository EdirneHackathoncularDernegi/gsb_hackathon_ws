import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2024 Kariyer Platformu. Tüm hakları saklıdır.</p>
      <div className="footer-links">
        <a href="/privacy">Gizlilik Politikası</a>
        <a href="/contact">İletişim</a>
      </div>
    </footer>
  );
};

export default Footer;
