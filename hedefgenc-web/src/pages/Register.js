import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
    } else {
      alert('Kayıt başarılı!');
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: 2,
        backgroundColor: '#f4f4f9',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 3,
          border: '2px solid #061141', // Çerçeve rengi
          borderRadius: '10px', // Yuvarlak köşeler
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Gölge efekti
          backgroundColor: '#ffffff', // Arka plan rengi
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Kayıt Ol
        </Typography>
        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{ mt: 2 }}
        >
          <TextField
            fullWidth
            label="E-posta"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Şifre"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Şifreyi Onayla"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mb: 2,
              backgroundColor: '#061141',
              '&:hover': {
                backgroundColor: '#f17a0B',
              },
            }}
          >
            Kayıt Ol
          </Button>
          <Typography align="center">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" underline="hover">
              Giriş Yap
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
