import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Typography, Container, Box, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import GifBackground from '../components/GifBackground';  
import Image from 'next/image';  

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/programs');
    } catch (error) {
      setError('Failed to log in');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="xl" sx={{ 
        border: '2px solid rgba(255, 255, 255, 0.2)', // Add border color
        borderRadius: 2, // Optional: rounded corners
        padding: 2 // Optional: padding inside the container
      }}>
        <Grid container sx={{ display:'flex', justifyContent:'center', height: '100vh' }}>
          {/* GIF Section */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <GifBackground />
          </Grid>

          {/* Login Section */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.paper', padding: 3, borderRadius: 2 }}>
            <Image
              src="/logo2.png" // Path to your logo file
              alt="FastFit Logo"
              width={200}  // Adjust size as needed
              height={50} // Adjust size as needed
              style={{ marginBottom: '10px' }}
            />
            <Typography component="h1" variant="h5" gutterBottom>
              Train hard, with FastFit
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              {error && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
