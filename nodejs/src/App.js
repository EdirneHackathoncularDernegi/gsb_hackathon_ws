import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Navbar bileşenini içeri aktar
import Home from './pages/Home';
import './styles/global.css';
import Footer from './components/Footer';
import MapPage from './pages/MapPage';
<Route path="/map" element={<MapPage />} />

function App() {
  return (
    <Router>
      <Navbar /> {}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} /> {}
        {/* Diğer rotalar */}
      </Routes>
      <Footer /> {}
    </Router>
  );
}

export default App;
