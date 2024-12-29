import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);

  // Sesli okuma fonksiyonu
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
    }
  };

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('events')) || [];
    const updatedEvents = storedEvents.map((event, index) => ({
      ...event,
      date:
        event.date ||
        (index % 3 === 0
          ? '2025-01-01'
          : index % 3 === 1
          ? '2024-12-31'
          : '2024-12-30'),
    }));
    setEvents(updatedEvents.slice(0, 6));

    const mockNews = [
      {
        id: 2,
        title: 'Gençler Deprem Bilincini Artırıyor: Eğitim Kampanyası Başladı!',
        summary:
          'Son dönemde yaşanan depremlerin ardından, Gençlik ve Spor Bakanlığı gençlere yönelik bir deprem bilinçlendirme kampanyası başlattı. ',
      },
      {
        id: 3,
        title: 'Gençler İklim İçin Harekette: Büyük Eyleme Hazırlık',
        summary:
          'Türkiye’nin dört bir yanından gençler, iklim değişikliğine dikkat çekmek için bir araya geliyor. ',
      },
      {
        id: 4,
        title: 'KYK Borçlarına Yeni Düzenleme: Gençlere Ödeme Kolaylığı!',
        summary:
          'Hazine ve Maliye Bakanlığı, KYK kredi borcu olan gençlere yönelik yeni bir düzenleme açıkladı.',
      },
    ];
    setNews(mockNews);
  }, []);

  return (
    <div className="home">
      <header className="hero-section">
        <h1>HedefGenç</h1>
        <p>Geleceğinizi inşa etmek için doğru yerdesiniz!</p>
        <button className="cta-button">
          <Link to="/map" style={{ color: 'white', textDecoration: 'none' }}>
            Haritada Etkinlikleri Keşfet
          </Link>
        </button>
      </header>
      <div className="container">
        <h2 className="centered-title">
          Yaklaşan Etkinlikler
          <button
            onClick={() => speakText(events.map((event) => `${event.title}, ${event.date}`).join('. '))}
            onMouseEnter={() => speakText('Sesli okutmak için buraya tıklayın')}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#f17a0b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Sesli Oku
          </button>
        </h2>
        <div className="event-cards-container">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>
                <strong>Kategori:</strong> {event.category}
              </p>
              <p>
                <strong>Tarih:</strong>{' '}
                {event.date ? new Date(event.date).toLocaleDateString() : 'Tarih Bilinmiyor'}
              </p>
              <Link to={`/event/${event.id}`}>
                <button className="detail-button">Detayları Gör</button>
              </Link>
            </div>
          ))}
        </div>
        <button className="cta-button">
          <Link to="/map" style={{ color: 'white', textDecoration: 'none' }}>
            Daha Fazla Gör
          </Link>
        </button>

        <h2 className="centered-title">
          Haberler
          <button
            onClick={() => speakText(news.map((item) => `${item.title}: ${item.summary}`).join('. '))}
            onMouseEnter={() => speakText('Sesli okutmak için buraya tıklayın')}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#f17a0b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Sesli Oku
          </button>
        </h2>
        <div className="news-cards-container">
          {news.map((newsItem) => (
            <div key={newsItem.id} className="news-card">
              <h3>{newsItem.title}</h3>
              <p>{newsItem.summary}</p>
              <Link to={`/news/${newsItem.id}`}>
                <button className="detail-button">Devamını Oku</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
