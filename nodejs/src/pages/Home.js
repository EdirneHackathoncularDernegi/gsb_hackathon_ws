import React from 'react';
import EventCard from '../components/EventCard';
import NewsCard from '../components/NewsCard';
import '../styles/home.css';

const Home = () => {
  // Mock data for events and news
  const events = [
    { id: 1, title: 'Kariyer Fuarı', category: 'Kariyer', date: '2025-01-15' },
    { id: 2, title: 'Yapay Zeka Eğitimi', category: 'Teknoloji', date: '2025-01-20' },
  ];

  const news = [
    { id: 1, title: 'Yeni İş Fırsatları!', summary: 'Lorem ipsum...', category: 'Kariyer' },
    { id: 2, title: 'Teknoloji Konferansı', summary: 'Lorem ipsum...', category: 'Teknoloji' },
  ];

  return (
    <div className="home">
      <header className="hero-section">
        <h1>Geleceğinizi İnşa Edin</h1>
        <p>Kariyer hedeflerinize uygun etkinlikleri keşfedin.</p>
        <button className="cta-button">Hemen Keşfet</button>
      </header>
      <div className="container">
        <h2 className="centered-title">Yaklaşan Etkinlikler</h2>
        <div className="event-cards-container">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <h2 className="centered-title">Haberler</h2>
        <div className="news-cards-container">
          {news.map((newsItem) => (
            <NewsCard key={newsItem.id} news={newsItem} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
