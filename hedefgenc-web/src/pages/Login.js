import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import edevletLogo from '../assets/images/edevlet-logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [edevletPassword, setEdevletPassword] = useState('');
  const [isEdevletDialogOpen, setIsEdevletDialogOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'test@example.com' && password === 'password') {
      alert('Giriş başarılı!');
      login();
      navigate('/');
    } else {
      alert('Geçersiz e-posta veya şifre!');
    }
  };

  const handleEdevletLogin = () => {
    if (tcNo === '12345678901' && edevletPassword === 'edevlet123') {
      alert('e-Devlet giriş başarılı!');
      login();
      setIsEdevletDialogOpen(false);
      navigate('/');
    } else {
      alert('Geçersiz TC Kimlik Numarası veya Şifre!');
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
          Giriş Yap
        </Typography>
        <Box
          component="form"
          onSubmit={handleLogin}
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
            Giriş Yap
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setIsEdevletDialogOpen(true)}
            sx={{
              mb: 2,
              padding: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={edevletLogo}
              alt="e-Devlet ile Giriş Yap"
              style={{
                height: '48px',
                width: '100%',
                objectFit: 'contain',
                maxWidth: '400px',
              }}
            />
          </Button>
          <Typography align="center">
            Henüz hesabınız yok mu?{' '}
            <Link href="/register" underline="hover">
              Kayıt Ol
            </Link>
          </Typography>
        </Box>
      </Box>

      <Dialog open={isEdevletDialogOpen} onClose={() => setIsEdevletDialogOpen(false)}>
        <DialogTitle>e-Devlet ile Giriş</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="TC Kimlik Numarası"
            type="text"
            variant="outlined"
            value={tcNo}
            onChange={(e) => setTcNo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Şifre"
            type="password"
            variant="outlined"
            value={edevletPassword}
            onChange={(e) => setEdevletPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEdevletDialogOpen(false)} color="secondary">
            İptal
          </Button>
          <Button onClick={handleEdevletLogin} variant="contained" color="primary">
            Giriş Yap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
