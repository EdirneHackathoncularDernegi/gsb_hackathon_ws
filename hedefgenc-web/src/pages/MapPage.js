import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/map.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MapPage = () => {
  const { isLoggedIn } = useAuth(); // Giriş durumu kontrolü
  const mapRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [nearestEvents, setNearestEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const infoWindowRef = useRef(null);

  const eventCategories = {
    'Gençlik Festivali': 'Sosyal',
    'Kariyer Zirvesi': 'Kariyer',
    'Spor Etkinliği': 'Sosyal',
    'Teknoloji Konferansı': 'Teknoloji',
    'Sosyal Sorumluluk Çalıştayı': 'Sosyal',
  };
  

  useEffect(() => {
    const loadMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.92077, lng: 32.85411 },
        zoom: 6,
      });

      const cities = [
        { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
        { name: 'Ankara', lat: 39.9208, lng: 32.8541 },
        { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
        { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
        { name: 'Bursa', lat: 40.1826, lng: 29.0661 },
        { name: 'Adana', lat: 37.0, lng: 35.3213 },
        { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
        { name: 'Edirne', lat: 41.6771, lng: 26.5557 },
      ];

      const eventNames = [
        'Gençlik Festivali',
        'Kariyer Zirvesi',
        'Spor Etkinliği',
        'Teknoloji Konferansı',
        'Sosyal Sorumluluk Çalıştayı',
      ];

      const generateEvents = () => {
       const events = Array.from({ length: 50 }, (_, i) => {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const eventName = eventNames[Math.floor(Math.random() * eventNames.length)];
      const category = eventCategories[eventName] || 'Genel'; // Kategori eşleşmesi yapılır
      const date = new Date(2024, 11, 30 + Math.floor(Math.random() * 2));
      const hours = 9 + Math.floor(Math.random() * 11);
      const minutes = Math.random() < 0.5 ? '00' : '30';

          return {
            id: i + 1,
            title: eventName,
            description: `Bu etkinlik, ${city.name} şehrinde gerçekleşecektir.<br>Tarih: ${date.toLocaleDateString()} Saat: ${hours}:${minutes}`,
            category,
            city: city.name,
            location: {
              lat: city.lat + (Math.random() * 0.04 - 0.02),
              lng: city.lng + (Math.random() * 0.04 - 0.02),
            },
          };
        });
        localStorage.setItem('events', JSON.stringify(events)); // Etkinlikleri localStorage'a kaydedin
    return events;
      };

      const generatedEvents = generateEvents();
      setEvents(generatedEvents);

      infoWindowRef.current = new window.google.maps.InfoWindow();

      const markers = generatedEvents.map((event) => {
        const marker = new window.google.maps.Marker({
          position: event.location,
          map,
          title: event.title,
        });

        marker.addListener('click', () => {
          const infoWindowContent = document.createElement('div');
          ReactDOM.render(
            <div>
              <h4 style={{ color: '#333' }}>{event.title}</h4>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{event.description.replace(/<br>/g, '\n')}</p>
              {isLoggedIn ? (
  <button
    onClick={() => alert(`Etkinliğe Katılıyorsunuz: ${event.title}`)}
    className="hemen-katil-btn"
  >
    Hemen Katıl
  </button>
) : (
  <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>
    Etkinliğe katılmak için giriş yapmalısınız!
  </p>
)}
            </div>,
            infoWindowContent
          );

          infoWindowRef.current.setContent(infoWindowContent);
          infoWindowRef.current.open(map, marker);
        });

        return { marker, category: event.category };
      });

      const updateMarkers = (category) => {
        markers.forEach(({ marker, category: markerCategory }) => {
          if (category === 'all' || markerCategory === category) {
            marker.setMap(map);
          } else {
            marker.setMap(null);
          }
        });
      };

      updateMarkers(selectedCategory);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userLocation);

            const userMarker = new window.google.maps.Marker({
              position: userLocation,
              map,
              title: 'Sizin Konumunuz',
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              },
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: '<div><h4>Şu Anki Konumunuz</h4></div>',
            });

            userMarker.addListener('click', () => {
              infoWindow.open(map, userMarker);
            });

            map.setCenter(userLocation);
          },
          (error) => console.error('Geolocation Error:', error)
        );
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCSrkJ1PVh6eiTZ5fUIWAuIhxZIDEwAC-Y`;
      script.async = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    } else {
      loadMap();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedCategory, isLoggedIn]);

  useEffect(() => {
    if (userLocation) {
      const sortedEvents = events
        .map((event) => {
          const distance = calculateDistance(userLocation, event.location);
          return { ...event, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      setNearestEvents(sortedEvents.slice(0, 3));
    }
  }, [userLocation, events]);

  const calculateDistance = (loc1, loc2) => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Kilometre cinsinden mesafe
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="map-page">
      <h1 className="centered-title">Etkinlik Haritası</h1>
      <div className="filter-menu">
        <button onClick={() => handleCategoryChange('all')}>Tümü</button>
        <button onClick={() => handleCategoryChange('Kariyer')}>Kariyer</button>
        <button onClick={() => handleCategoryChange('Teknoloji')}>Teknoloji</button>
        <button onClick={() => handleCategoryChange('Sosyal')}>Sosyal</button>
      </div>
      <div className="map-container" ref={mapRef}></div>
      <div className="nearest-events">
        <h2>En Yakın Etkinlikler</h2>
        <ul>
          {nearestEvents.map((event) => (
            <li key={event.id}>
              <Link to={`/event/${event.id}`} style={{fontWeight:'bold', textDecoration: 'none', color: '#061141' }}>
                {event.title} - {event.distance.toFixed(2)} km
              </Link>
              <br />
              <span dangerouslySetInnerHTML={{ __html: event.description }}></span>
              <br />
              {isLoggedIn ? (
                <button
                  onClick={() => alert(`Etkinliğe Katılıyorsunuz: ${event.title}`)}
                  className="hemen-katil-btn"
                >
                  Hemen Katıl
                </button>
              ) : (
                <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>
                  Etkinliğe katılmak için giriş yapmalısınız!
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="youth-centers">
  <h2>Gençlik Merkezleri, Genç Ofisler ve Gençlik Kampları</h2>
  <div className="map-embed">
    <iframe
      src="https://www.google.com/maps/d/embed?mid=1jMkd_fyV2hafqG_R3xOVbcnpYWAyMsU&hl=tr&ehbc=2E312F"
      width="100%"
      height="480"
      style={{
        border: 0,
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
      allowFullScreen=""
      loading="lazy"
      title="Gençlik Merkezleri ve Kampları Haritası"
    ></iframe>
  </div>
</div>
    </div>
  );
};

export default MapPage;
