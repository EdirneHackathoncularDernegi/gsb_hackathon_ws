import React, { useEffect, useRef, useState } from 'react';
import '../styles/map.css';

const MapPage = () => {
  const mapRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.92077, lng: 32.85411 },
        zoom: 12,
      });

      const events = [
        { id: 1, title: 'Kariyer Fuarı', category: 'Kariyer', location: { lat: 39.9211, lng: 32.8551 } },
        { id: 2, title: 'Yapay Zeka Eğitimi', category: 'Teknoloji', location: { lat: 39.9255, lng: 32.8605 } },
        { id: 3, title: 'Sosyal Sorumluluk Semineri', category: 'Sosyal', location: { lat: 39.9222, lng: 32.8580 } },
      ];

      const markers = events.map((event) => {
        const marker = new window.google.maps.Marker({
          position: event.location,
          map,
          title: event.title,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><h4>${event.title}</h4></div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
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

      // Kullanıcı Lokasyonu Gösterimi
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

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

            map.setCenter(userLocation); // Harita merkezini kullanıcının konumuna ayarla
          },
          (error) => console.error('Geolocation Error:', error)
        );
      } else {
        console.error('Geolocation not supported by this browser.');
      }

      return updateMarkers;
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
  }, [selectedCategory]);

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
    </div>
  );
};

export default MapPage;
