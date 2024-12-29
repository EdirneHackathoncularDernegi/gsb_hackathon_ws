import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Etkinlik bilgilerini çek
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const foundEvent = events.find((event) => event.id === parseInt(id, 10));
    setEvent(foundEvent);
  }, [id]);

  const handleJoinEvent = () => {
    if (!isLoggedIn) {
      alert('Etkinliğe katılmak için lütfen giriş yapınız.');
      navigate('/login'); // Kullanıcıyı giriş sayfasına yönlendir
    } else {
      alert(`Etkinliğe Katılıyorsunuz: ${event.title}`);
    }
  };

  if (!event) {
    return <div>Etkinlik bulunamadı.</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>{event.title}</h1>
      <p>{event.description.replace(/<br>/g, '\n')}</p>
      <p>
        <strong>Kategori:</strong> {event.category}
      </p>
      <p>
        <strong>Şehir:</strong> {event.city || 'Belirtilmemiş'}
      </p>
      <button
        onClick={handleJoinEvent}
        style={{
          backgroundColor: '#007BFF',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Etkinliğe Katıl
      </button>
    </div>
  );
};

export default EventDetail;
