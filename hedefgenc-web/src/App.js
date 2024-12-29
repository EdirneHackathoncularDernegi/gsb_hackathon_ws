import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CareerPath from './pages/CareerPath';
import Courses from './pages/Courses';
import SoruCAN from './pages/SoruCAN';
import Profile from './pages/Profile';
import News from './pages/News';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import Privacy from './pages/Privacy';
import KVKK from './pages/KVKK';
import Contact from './pages/Contact';
import NewsDetail from './pages/NewsDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/career-path" element={<CareerPath />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/soru-can" element={<SoruCAN />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/news" element={<News />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
