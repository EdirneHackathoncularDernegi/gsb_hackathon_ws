import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import news2 from '../assets/images/news2.jpg';
import news3 from '../assets/images/news3.jpg';
import news4 from '../assets/images/news4.jpg';
import news5 from '../assets/images/news5.jpg';
import news6 from '../assets/images/news6.jpg';
import news7 from '../assets/images/news7.jpg';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);

  useEffect(() => {
    const newsData = [
      {
        id: 2,
        title: 'Gençler Deprem Bilincini Artırıyor: Eğitim Kampanyası Başladı',
        content: `Son dönemde yaşanan depremlerin ardından, Gençlik ve Spor Bakanlığı gençlere yönelik bir deprem bilinçlendirme kampanyası başlattı.
                  <br /><br />
                  Kampanya kapsamında, doğru müdahale teknikleri, afet sonrası dayanışma ve ilk yardım eğitimleri sunuluyor.
  <br /><br /> Etkinlik Detayları:
	•	Tarih: 15-20 Ocak 2025
	•	Yer: Türkiye genelindeki gençlik merkezleri.
Gençler, kampanya süresince eğitim alarak yerel gönüllü ekiplerine katılma fırsatı bulacak.`,
        image: news2,
      },
      {
        id: 3,
        title: 'Gençler İklim İçin Harekette: Büyük Eyleme Hazırlık',
        content: `Türkiye’nin dört bir yanından gençler, iklim değişikliğine dikkat çekmek için bir araya geliyor. Gençlik İklim Forumu, 25 Ocak 2025 tarihinde İstanbul’da düzenlenecek. Forumda, sürdürülebilirlik ve çevre koruma konularında gençlerin fikirleri tartışılacak.
                  <br /><br />
                  Forum Detayları:
	•	Tarih: 25 Ocak 2025
	•	Yer: İstanbul Kongre Merkezi.
Etkinliğe katılım ücretsizdir. Çevrimiçi katılım için kayıt yapabilirsiniz. `,
        image: news3,
      },
      {
        id: 4,
        title: 'KYK Borçlarına Yeni Düzenleme: Gençlere Ödeme Kolaylığı!',
        content: `Hazine ve Maliye Bakanlığı, KYK kredi borcu olan gençlere yönelik yeni bir düzenleme açıkladı. Yeni düzenleme ile ödeme süreleri uzatılırken, ilk iki yıl için faiz alınmayacak.
                  <br /><br />
                  Gençler için Önemli Maddeler:
	•	İlk iki yıl geri ödeme yapılmayabilecek.
	•	Faiz uygulaması tamamen kaldırıldı.
	•	Aylık ödeme tutarları, gençlerin gelir durumuna göre belirlenecek.`,
        image: news4,
      },
      {
        id: 5,
        title: 'Yapay Zeka ve Blockchain: Gençlik Atölyeleri Gündemde',
        content: `Son haftalarda gençlerin yoğun ilgi gösterdiği Yapay Zeka ve Blockchain Atölyeleri, Türkiye genelinde teknolojiye meraklı gençleri bir araya getiriyor. Atölyelerde yeni başlayanlar için temel eğitimler verilirken, ileri düzey projeler geliştirmek isteyenler için özel mentor desteği sunuluyor.
                  <br /><br />
                  Gündemden Not: İlk eğitim oturumu sırasında 500’den fazla genç kayıt yaptı ve katılım yoğun bir ilgiyle devam ediyor.
Son kayıt tarihi: 10 Ocak 2025. `,
        image: news5,
      },
      {
        id: 6,
        title: '2026 Seçimleri: İlk Kez Oy Kullanacak Gençler İçin Bilgilendirme Yayını',
        content: `Yüksek Seçim Kurulu (YSK), 2026 yılında ilk kez oy kullanacak 1.5 milyon genç için bir rehber yayınladı. Bu rehberde, seçim günü yapılması gerekenler, oy kullanma süreci ve seçim güvenliği hakkında bilgilere yer veriliyor.
                  <br /><br />
                  Rehber Özeti:
	•	E-devlet üzerinden seçmen kaydı kontrolü.
	•	Seçim günü kurallar ve güvenlik önlemleri.
	•	Oy kullanma süreci ve nelere dikkat edilmesi gerektiği.`,
        image: news6,
      },
      {
        id: 7,
        title: '2025’te Gençler İçin Daha Fazla Burs, Daha Fazla Fırsat!',
        content: `Gençlik ve Spor Bakanı yaptığı açıklamada, 2025 yılı için gençlere yönelik yeni fırsatların hayata geçirileceğini duyurdu.
                  <br /><br />
                 İşte yeni yılda hayata geçirilecek projelerden bazıları:
	•	Burs Programları: Daha fazla öğrenciye ulaşacak şekilde artırılacak.
	•	Spor Merkezleri: Her şehirde yeni gençlik merkezleri açılacak.
	•	Gönüllülük Programları: Gençlerin sosyal projelere daha aktif katılmaları sağlanacak.
Detaylar yakında açıklanacak.`,
        image: news7,
      },
    ];

    const foundNews = newsData.find((news) => news.id === parseInt(id, 10));
    setNewsItem(foundNews || null);
  }, [id]);

  if (!newsItem) {
    return <div style={styles.notFound}>Haber bulunamadı.</div>;
  }

  return (
    <div style={styles.newsDetail}>
      <div style={styles.header}>
        <img src={newsItem.image} alt={newsItem.title} style={styles.image} />
        <h1 style={styles.title}>{newsItem.title}</h1>
      </div>
      <div style={styles.content}>
        <p dangerouslySetInnerHTML={{ __html: newsItem.content }}></p>
      </div>
    </div>
  );
};

const styles = {
  newsDetail: {
    fontFamily: 'Arial, sans-serif',
    margin: '20px auto',
    maxWidth: '800px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
  },
  notFound: {
    textAlign: 'center',
    fontSize: '20px',
    color: 'red',
    margin: '50px',
  },
};

export default NewsDetail;
