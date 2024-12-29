import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/news.css';

// Resimleri import edin
import news2 from '../assets/images/news2.jpg';
import news3 from '../assets/images/news3.jpg';
import news4 from '../assets/images/news4.jpg';
import news5 from '../assets/images/news5.jpg';
import news6 from '../assets/images/news6.jpg';
import news7 from '../assets/images/news7.jpg';

const News = () => {
  const [newsList, setNewsList] = useState([]);

  // Sesli okuma fonksiyonu
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Mevcut konuşmayı iptal et
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
    }
  };

  useEffect(() => {
    const allNews = [
      {
        id: 2,
        title: 'Gençler Deprem Bilincini Artırıyor: Eğitim Kampanyası Başladı!',
        summary: 'Son dönemde yaşanan depremlerin ardından, Gençlik ve Spor Bakanlığı gençlere yönelik bir deprem bilinçlendirme kampanyası başlattı.',
        image: news2,
      },
      {
        id: 3,
        title: 'Gençler İklim İçin Harekette: Büyük Eyleme Hazırlık',
        summary:
          "Türkiye’nin dört bir yanından gençler, iklim değişikliğine dikkat çekmek için bir araya geliyor.",
        image: news3,
      },
      {
        id: 4,
        title: 'KYK Borçlarına Yeni Düzenleme: Gençlere Ödeme Kolaylığı!',
        summary: "Hazine ve Maliye Bakanlığı, KYK kredi borcu olan gençlere yönelik yeni bir düzenleme açıkladı.",
        image: news4,
      },
      {
        id: 5,
        title: 'Yapay Zeka ve Blockchain: Gençlik Atölyeleri Gündemde',
        summary:
          'Son haftalarda gençlerin yoğun ilgi gösterdiği Yapay Zeka ve Blockchain Atölyeleri, Türkiye genelinde teknolojiye meraklı gençleri bir araya getiriyor.',
        image: news5,
      },
      {
        id: 6,
        title: '2025 Seçimleri: İlk Kez Oy Kullanacak Gençler İçin Bilgilendirme Yayını',
        summary: 'Yüksek Seçim Kurulu (YSK), 2025 yılında ilk kez oy kullanacak 1.5 milyon genç için bir rehber yayınladı. ',
        image: news6,
      },
      {
        id: 7,
        title: '2025’te Gençler İçin Daha Fazla Burs, Daha Fazla Fırsat!',
        summary:
          'Gençlik ve Spor Bakanı yaptığı açıklamada, 2025 yılı için gençlere yönelik yeni fırsatların hayata geçirileceğini duyurdu.',
        image: news7,
      },
    ];

    setNewsList(allNews);
  }, []);

  return (
    <div className="news-page">
      <h1 className="news-title">Haberler</h1>
      <div className="news-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {newsList.map((newsItem) => (
          <div
            key={newsItem.id}
            className="news-card"
            style={{
              width: '300px',
              height: '400px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <img
              src={newsItem.image}
              alt={newsItem.title}
              className="news-image"
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div className="news-content" style={{ padding: '15px', flexGrow: 1 }}>
              <h3 style={{ marginBottom: '10px', fontSize: '18px', color: '#333' }}>{newsItem.title}</h3>
              <p style={{ marginBottom: '15px', fontSize: '14px', color: '#555' }}>{newsItem.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to={`/news/${newsItem.id}`}>
                  <button
                    className="news-link"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f17a0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    Devamını Oku
                  </button>
                </Link>
                <span
                  onClick={() => speakText(`${newsItem.title}: ${newsItem.summary}`)}
                  onMouseEnter={() => speakText('Sesli okutmak için buraya tıklayın')}
                  style={{
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#f17a0b',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  title="Sesli Okuma"
                >
                  🔊
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
