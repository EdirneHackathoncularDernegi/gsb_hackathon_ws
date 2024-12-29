import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Gizlilik Politikası</h1>
      <p>
        Bu Gizlilik Politikası, HedefGenç platformunun kullanıcı verilerini nasıl topladığını,
        kullandığını ve koruduğunu açıklar. Platformumuz, kişisel verilerinizi güvenli bir şekilde
        saklamayı taahhüt eder.
      </p>
      <h2>Toplanan Veriler</h2>
      <ul>
        <li>Kullanıcı adı, soyadı, e-posta adresi</li>
        <li>e-Devlet üzerinden alınan kimlik bilgileri</li>
        <li>Katıldığınız etkinlikler ve tercihleriniz</li>
      </ul>
      <h2>Verilerin Kullanımı</h2>
      <p>
        Topladığımız veriler, size daha iyi bir kullanıcı deneyimi sunmak, kariyer önerileri
        oluşturmak ve etkinliklere katılımınızı sağlamak amacıyla kullanılacaktır.
      </p>
      <h2>İletişim</h2>
      <p>
        Gizlilik politikamız hakkında sorularınız varsa, lütfen{' '}
        <a href="/contact" style={{ color: '#007BFF' }}>
          İletişim
        </a>{' '}
        sayfasını ziyaret edin.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
