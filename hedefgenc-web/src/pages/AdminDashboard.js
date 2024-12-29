import React, { useState } from 'react';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const [users, setUsers] = useState([
    { id: 1, name: 'Ali Veli', email: 'ali@example.com', role: 'User' },
    { id: 2, name: 'Ayse Gul', email: 'ayse@example.com', role: 'Admin' },
  ]);
  const [courses, setCourses] = useState([
    { id: 1, title: 'Siber Güvenlik 101', description: 'Temel Siber Güvenlik Eğitimi' },
    { id: 2, title: 'Web Geliştirme', description: 'HTML ve CSS ile Web Geliştirme' },
  ]);
  const [events, setEvents] = useState([
    { id: 1, title: 'AI Konferansı', date: '2025-01-03', time: '14:00' },
    { id: 2, title: 'Blockchain Teknolojisi', date: '2025-01-05', time: '10:00' },
  ]);
  const [news, setNews] = useState([
    { id: 1, title: 'Yapay Zeka Konferansı', summary: 'Makine Öğrenimi ve Yapay Zeka.' },
    { id: 2, title: 'Blockchain Teknolojisi', summary: 'Dağıtık defter teknolojisinin geleceği.' },
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === 'test' && credentials.password === 'test') {
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Kullanıcı adı veya şifre yanlış!');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleDelete = (type, id) => {
    if (type === 'user') {
      setUsers(users.filter((user) => user.id !== id));
    } else if (type === 'course') {
      setCourses(courses.filter((course) => course.id !== id));
    } else if (type === 'event') {
      setEvents(events.filter((event) => event.id !== id));
    } else if (type === 'news') {
      setNews(news.filter((newsItem) => newsItem.id !== id));
    }
  };

  const handleAdd = (type) => {
    const title = prompt('Yeni öğe başlığını girin:');
    if (!title) return;

    const descriptionOrDetails = prompt('Açıklama veya detay girin:');
    if (!descriptionOrDetails) return;

    if (type === 'user') {
      setUsers([...users, { id: Date.now(), name: title, email: descriptionOrDetails, role: 'User' }]);
    } else if (type === 'course') {
      setCourses([...courses, { id: Date.now(), title, description: descriptionOrDetails }]);
    } else if (type === 'event') {
      const [date, time] = descriptionOrDetails.split(' / ');
      setEvents([...events, { id: Date.now(), title, date, time }]);
    } else if (type === 'news') {
      setNews([...news, { id: Date.now(), title, summary: descriptionOrDetails }]);
    }
  };

  const handleEdit = (type, id) => {
    const itemToEdit =
      type === 'user'
        ? users.find((user) => user.id === id)
        : type === 'course'
        ? courses.find((course) => course.id === id)
        : type === 'event'
        ? events.find((event) => event.id === id)
        : news.find((newsItem) => newsItem.id === id);

    const newTitle = prompt('Yeni başlık:', itemToEdit.title || itemToEdit.name);
    if (!newTitle) return;

    const newDetails = prompt('Yeni açıklama/detay:', itemToEdit.description || itemToEdit.email || itemToEdit.summary);
    if (!newDetails) return;

    if (type === 'user') {
      setUsers(users.map((user) => (user.id === id ? { ...user, name: newTitle, email: newDetails } : user)));
    } else if (type === 'course') {
      setCourses(courses.map((course) => (course.id === id ? { ...course, title: newTitle, description: newDetails } : course)));
    } else if (type === 'event') {
      const [date, time] = newDetails.split(' / ');
      setEvents(events.map((event) => (event.id === id ? { ...event, title: newTitle, date, time } : event)));
    } else if (type === 'news') {
      setNews(news.map((newsItem) => (newsItem.id === id ? { ...newsItem, title: newTitle, summary: newDetails } : newsItem)));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Admin Girişi</h2>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="Kullanıcı adınızı giriniz"
            />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Şifrenizi giriniz"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-button">Giriş Yap</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Paneli</h1>
      {['user', 'course', 'event', 'news'].map((type) => (
        <div className="admin-section" key={type}>
          <h2>{type === 'user' ? 'Kullanıcı' : type === 'course' ? 'Kurs' : type === 'event' ? 'Etkinlik' : 'Haber'} Yönetimi</h2>
          <ul>
            {(type === 'user' ? users : type === 'course' ? courses : type === 'event' ? events : news).map((item) => (
              <li key={item.id}>
                {type === 'user'
                  ? `${item.name} (${item.email})`
                  : type === 'course'
                  ? `${item.title} - ${item.description}`
                  : type === 'event'
                  ? `${item.title} - ${item.date} - ${item.time}`
                  : `${item.title} - ${item.summary}`}
                <button onClick={() => handleEdit(type, item.id)}>Düzenle</button>
                <button onClick={() => handleDelete(type, item.id)}>Sil</button>
              </li>
            ))}
          </ul>
          <button onClick={() => handleAdd(type)}>{type === 'user' ? 'Kullanıcı' : type === 'course' ? 'Kurs' : type === 'event' ? 'Etkinlik' : 'Haber'} Ekle</button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
