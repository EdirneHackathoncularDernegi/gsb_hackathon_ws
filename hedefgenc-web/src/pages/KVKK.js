import React from 'react';

const KVKK = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>KVKK Açık Rıza Beyanı</h1>
      <p>
        HedefGenç platformu olarak, Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınızı
        koruyoruz ve verilerinizin güvenliğini önemsiyoruz.
      </p>
      <h2>Hangi Veriler Toplanır?</h2>
      <p>
        e-Devlet girişinizle paylaştığınız bilgiler (örneğin ad, soyad, kimlik numarası) ve
        platformdaki aktiviteleriniz (katıldığınız etkinlikler, tercih ettiğiniz alanlar) kaydedilir.
      </p>
      <h2>Veri İşleme Amaçları</h2>
      <p>
        Verileriniz, platformumuzun size özelleştirilmiş kariyer önerileri sunmasını ve etkinlik
        katılım süreçlerini yönetmesini sağlamak amacıyla işlenmektedir.
      </p>
      <h2>Haklarınız</h2>
      <p>
        KVKK kapsamında, verilerinizin silinmesini, düzeltilmesini veya erişimini talep etme
        hakkına sahipsiniz. Bu haklarınızı kullanmak için{' '}
        <a href="/contact" style={{ color: '#007BFF' }}>
          İletişim
        </a>{' '}
        sayfasından bizimle iletişime geçebilirsiniz.
      </p>
    </div>
  );
};

export default KVKK;
