import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Form alanlarının kontrolü
    if (!name || !email || !message) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    // Eğer tüm kontroller geçerse:
    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: '#333', mb: 3 }}>
        İletişim
      </Typography>
      <Typography variant="body1" sx={{ color: '#666', mb: 5, textAlign: 'center', maxWidth: '600px' }}>
        Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.
        Aşağıdaki formu doldurarak bize ulaşabilirsiniz.
      </Typography>

      {/* Hata ve başarı mesajları */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Mesajınız başarıyla gönderildi!</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TextField
          label="Adınız"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="E-posta Adresiniz"
          variant="outlined"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Mesajınız"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            padding: '10px 15px',
            borderRadius: '5px',
            fontSize: '16px',
            textTransform: 'none',
            backgroundColor: '#007BFF',
            ':hover': { backgroundColor: '#0056b3' },
          }}
        >
          Gönder
        </Button>
      </Box>

      <Box sx={{ mt: 5, textAlign: 'center', color: '#666' }}>
        <Typography variant="body2">
          <strong>Adres:</strong> Edirne, Türkiye
        </Typography>
        <Typography variant="body2">
          <strong>Telefon:</strong> +90 531 577 88 96
        </Typography>
        <Typography variant="body2">
          <strong>E-posta:</strong> hedefgenc@matiricie.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Contact;
