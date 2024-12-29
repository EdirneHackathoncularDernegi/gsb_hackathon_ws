import React, { useState, useEffect } from 'react';
import '../styles/Courses.css';

const mockCourses = [
  {
    id: 1,
    name: 'Siber Güvenlik Temelleri',
    category: 'Siber Güvenlik',
    image: require('../assets/images/siberguvenliktemelleri.jpg'),
    description: 'Siber güvenlik hakkında temel bilgiler.',
  },
  {
    id: 2,
    name: 'Etik Hacking',
    category: 'Siber Güvenlik',
    image: require('../assets/images/etikhacking.jpg'),
    description: 'Etik hacking dünyasına giriş yapın.',
  },
  {
    id: 3,
    name: 'Zaman Yönetimi',
    category: 'Kişisel Gelişim',
    image: require('../assets/images/zamanyonetimi.jpg'),
    description: 'Zamanınızı daha iyi nasıl yönetebilirsiniz?',
  },
  {
    id: 4,
    name: 'Takım Yönetimi',
    category: 'Kişisel Gelişim',
    image: require('../assets/images/takimyonetimi.jpg'),
    description: 'Ekiplerinizi etkin şekilde yönetin.',
  },
  {
    id: 5,
    name: 'HTML ve CSS',
    category: 'Web Geliştirme',
    image: require('../assets/images/htmlvecss.jpg'),
    description: 'HTML ve CSS ile web geliştirmeye başlayın.',
  },
  {
    id: 6,
    name: 'JavaScript Temelleri',
    category: 'Web Geliştirme',
    image: require('../assets/images/javascriptemelleri.jpg'),
    description: 'JavaScript ile temel programlama öğrenin.',
  },
  {
    id: 7,
    name: 'Ağ Güvenliği',
    category: 'Siber Güvenlik',
    image: require('../assets/images/agguvenligi.jpg'),
    description: 'Ağ güvenliği tekniklerine giriş yapın.',
  },
  {
    id: 8,
    name: 'Kişisel Verimlilik',
    category: 'Kişisel Gelişim',
    image: require('../assets/images/kisiselverimlilik.jpg'),
    description: 'Günlük hayatınızı daha verimli hale getirin.',
  },
  {
    id: 9,
    name: 'React.js ile Web Geliştirme',
    category: 'Web Geliştirme',
    image: require('../assets/images/reactjsilewebgelistirme.jpg'),
    description: 'React.js ile modern web uygulamaları geliştirin.',
  },
];


const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [appliedCourses, setAppliedCourses] = useState([]);

  // Başvurulan kursları Local Storage'dan yükle
  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem('appliedCourses')) || [];
    setAppliedCourses(storedApplications);
  }, []);

  // Local Storage'a başvuruları kaydet
  const saveApplicationsToStorage = (applications) => {
    localStorage.setItem('appliedCourses', JSON.stringify(applications));
  };

  const handleApply = (courseId) => {
    alert('Başvurunuz alınmıştır! Sizinle en kısa sürede iletişime geçilecektir.');
    const updatedApplications = [...appliedCourses, courseId];
    setAppliedCourses(updatedApplications);
    saveApplicationsToStorage(updatedApplications); // Başvuruyu Local Storage'a kaydet
  };

  const filteredCourses =
    selectedCategory === 'Tümü'
      ? mockCourses
      : mockCourses.filter((course) => course.category === selectedCategory);

  return (
    <div className="courses-page">
      <div className="filter-buttons">
        {['Tümü', 'Siber Güvenlik', 'Kişisel Gelişim', 'Web Geliştirme'].map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="courses-container">
        {filteredCourses.map((course) => (
          <div key={course.id} className="course-card">
            <img src={course.image} alt={course.name} />
            <div className="course-card-content">
              <h3>{course.name}</h3>
              <p>{course.description}</p>
              <button
                className="apply-button"
                onClick={() => handleApply(course.id)}
                disabled={appliedCourses.includes(course.id)}
                style={{
                  backgroundColor: appliedCourses.includes(course.id) ? '#747474' : '',
                  color: appliedCourses.includes(course.id) ? 'white' : '',
                  cursor: appliedCourses.includes(course.id) ? 'not-allowed' : 'pointer',
                }}
              >
                {appliedCourses.includes(course.id) ? 'Başvuruldu' : 'Başvur'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
