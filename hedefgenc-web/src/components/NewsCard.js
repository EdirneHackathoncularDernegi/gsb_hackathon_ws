import React from 'react';

const NewsCard = ({ news }) => {
  return (
    <div className="news-card">
      <h3>{news.title}</h3>
      <p>{news.summary}</p>
      <p>Kategori: {news.category}</p>
    </div>
  );
};

export default NewsCard;
