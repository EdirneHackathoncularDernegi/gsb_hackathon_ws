import React, { useState, useEffect } from 'react';
import '../styles/profile.css';
import badge1 from '../assets/images/badge1.PNG';
import badge2 from '../assets/images/badge2.PNG';
import badge3 from '../assets/images/badge3.PNG';

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventsJoined: 0,
    coursesCompleted: 0,
    upcomingEvents: ['Etkinlik 1', 'Etkinlik 2', 'Etkinlik 3'],
    pastEvents: ['Etkinlik 4', 'Etkinlik 5', 'Etkinlik 6'],
    profilePicture: '',
    certificates: [
      { id: 1, name: 'Doğal Dil İşleme', institution: 'BTK Akademi', date: '01/01/2023' },
      { id: 2, name: 'HTML5 ile Web Geliştirme', institution: 'Geleceği Yazanlar', date: '15/02/2023' },
      { id: 3, name: 'Yapay Zekaya Giriş', institution: 'Udemy', date: '10/03/2023' },
      { id: 4, name: 'Proje Yönetimi', institution: 'Orta Doğu Teknik Üniversitesi', date: '20/04/2023' },
    ],
  });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    institution: '',
    date: '',
  });


  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    setProfile({
      firstName: savedProfile.firstName || 'Ali',
      lastName: savedProfile.lastName || 'Veli',
      email: savedProfile.email || 'test@example.com',
      phone: savedProfile.phone || '123-456-7890',
      eventsJoined: savedProfile.eventsJoined || 0,
      coursesCompleted: savedProfile.coursesCompleted || 0,
      upcomingEvents: savedProfile.upcomingEvents || ['Etkinlik 1', 'Etkinlik 2', 'Etkinlik 3'],
      pastEvents: savedProfile.pastEvents || ['Etkinlik 4', 'Etkinlik 5', 'Etkinlik 6'],
      profilePicture: savedProfile.profilePicture || '',
      certificates: savedProfile.certificates || [
        { id: 1, name: 'Doğal Dil İşleme', institution: 'BTK Akademi', date: '01/01/2023' },
        { id: 2, name: 'HTML5 ile Web Geliştirme', institution: 'Geleceği Yazanlar', date: '15/02/2023' },
        { id: 3, name: 'Yapay Zekaya Giriş', institution: 'Udemy', date: '10/03/2023' },
        { id: 4, name: 'Proje Yönetimi', institution: 'Orta Doğu Teknik Üniversitesi', date: '20/04/2023' },
      ],
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleAddCertificate = () => {
    if (!newCertificate.name || !newCertificate.institution || !newCertificate.date) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    const updatedCertificates = [
      ...profile.certificates,
      { id: profile.certificates.length + 1, ...newCertificate },
    ];
    setProfile({ ...profile, certificates: updatedCertificates });
    setNewCertificate({ name: '', institution: '', date: '' });
    setIsAddingCertificate(false);
    alert('Sertifika başarıyla eklendi!');
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Bilgileriniz başarıyla kaydedildi.');
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({ ...profile, profilePicture: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };
  


  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-picture-container">
          <img
            src={profile.profilePicture || '/assets/images/default-avatar.png'}
            alt="Profil Fotoğrafı"
            className="profile-picture"
          /><p></p>
          <button
            className="change-photo-button"
            onClick={() => document.querySelector('.profile-picture-upload').click()}
          >
            Profil Fotoğrafını Değiştir
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="profile-picture-upload"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="profile-info">
        <h2>Bilgilerim</h2>
        <div className="form-group">
          <label>Ad Soyad</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleInputChange}
            placeholder="Ad Soyad"
          />
        </div>
        <div className="form-group">
          <label>E-posta</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            placeholder="E-posta"
          />
        </div>
        <div className="form-group">
          <label>Telefon</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleInputChange}
            placeholder="Telefon"
          />
        </div>
      </div>

      <div className="goals">
        <h2>Hedeflerim</h2>
        <div className="goal-bar">
          <span>Siber Güvenlik Uzmanlığı</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: '65%' }}>
              %65
            </div>
          </div>
        </div>
      </div>

      <div className="badges">
  <h2>Rozetlerim</h2>
  <div className="badges-container">
    <div className="badge">
      <div className="badge-image">
        <img src={badge1} alt="Kurs" />
      </div>
      10 Kurs Tamamladınız
    </div>
    <div className="badge">
      <div className="badge-image">
        <img src={badge2} alt="Etkinlik" />
      </div>
      5 Etkinliğe Katıldınız
    </div>
    <div className="badge">
      <div className="badge-image">
        <img src={badge3} alt="Sertifika" />
      </div>
      2 Sertifika Aldınız
    </div>
  </div>
  {/* Puan Bölümü */}
  <div className="points-section">
    <p className="points-text">
      Topladığın puan: <strong>1.600</strong><br />
      Puanlarını{' '}
      <a 
        href="https://biz.gsb.gov.tr/shop/left_sidebar/?categoryId=0" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="points-link"
      >
        GencizBiz mağazasında
      </a>{' '}
      kullanabilirsin.
    </p>
  </div>
</div>

      <div className="events">
        <h2>Etkinliklerim</h2>
        <div className="events-tabs">
          <button
            className={activeTab === 'upcoming' ? 'active' : ''}
            onClick={() => setActiveTab('upcoming')}
          >
            Yaklaşan
          </button>
          <button
            className={activeTab === 'past' ? 'active' : ''}
            onClick={() => setActiveTab('past')}
          >
            Geçmiş
          </button>
        </div>
        <div className="events-section">
          {activeTab === 'upcoming' && (
            <ul>
              {profile.upcomingEvents.map((event, index) => (
                <li key={index} className="event-item">
                  {event}
                 
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'past' && (
            <ul>
              {profile.pastEvents.map((event, index) => (
                <li key={index} className="event-item">
                  {event}
                  <button className="view-certificate" onClick={() => window.open('sertifika.pdf', '_blank')}>
                    Sertifikayı Görüntüle
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="certificates">
  <h2>Sertifikalarım</h2>
  <div className="certificate-slider-container">
    <div className="certificate-slider">
      <div className="certificate-container">
        {/* Sertifikalar listesi */}
        {profile.certificates.map((cert, index) => (
          <div key={index} className="certificate">
            <a
              href={cert.file ? URL.createObjectURL(cert.file) : '/example.pdf'}
              download={cert.name + '.pdf'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h4>{cert.name}</h4>
            </a>
            <p>{cert.institution}</p>
            <p>{cert.date}</p>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Sertifika ekleme butonu ve formu */}
  <div className="add-certificate-section">
    <button
      className="add-certificate-button"
      onClick={() => setIsAddingCertificate(!isAddingCertificate)}
    >
      + Sertifika Ekle
    </button>
    {isAddingCertificate && (
      <div className="add-certificate-form">
        <input
          type="text"
          placeholder="Sertifika Adı"
          value={newCertificate.name}
          onChange={(e) =>
            setNewCertificate({ ...newCertificate, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Verilen Kurum"
          value={newCertificate.institution}
          onChange={(e) =>
            setNewCertificate({ ...newCertificate, institution: e.target.value })
          }
        />
        <input
          type="date"
          value={newCertificate.date}
          onChange={(e) =>
            setNewCertificate({ ...newCertificate, date: e.target.value })
          }
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setNewCertificate({ ...newCertificate, file });
            } else {
              alert('Lütfen geçerli bir PDF dosyası yükleyin.');
            }
          }}
        />
        <button
          onClick={() => {
            if (!newCertificate.name || !newCertificate.institution || !newCertificate.date || !newCertificate.file) {
              alert('Lütfen tüm alanları doldurun ve bir belge yükleyin.');
              return;
            }
            const updatedCertificates = [
              ...profile.certificates,
              {
                id: profile.certificates.length + 1,
                name: newCertificate.name,
                institution: newCertificate.institution,
                date: newCertificate.date,
                file: newCertificate.file,
              },
            ];
            setProfile({ ...profile, certificates: updatedCertificates });
            setNewCertificate({ name: '', institution: '', date: '', file: null });
            setIsAddingCertificate(false);
            alert('Sertifika başarıyla eklendi!');
          }}
        >
          Kaydet
        </button>
      </div>

)}

  </div>
</div>


      <div className="profile-actions">
        <button className="save-button" onClick={handleSave}>
          Bilgileri Kaydet
        </button>
      </div>
    </div>
  );
};

export default Profile;
