import React from 'react';
import '../styles/eventCard.css';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>Kategori: <strong>{event.category}</strong></p>
      <p>Tarih: <em>{event.date}</em></p>
      <button className="event-details-btn">Detayları Gör</button>
    </div>
  );
};

export default EventCard;
