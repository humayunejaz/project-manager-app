import { useState } from 'react';
import { supabase } from './supabase';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else {
      alert('Check your email to confirm registration.');
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Register</Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button variant="contained" type="submit">Register</Button>
          <Typography sx={{ mt: 2 }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#2563eb' }}>
              Login here
            </span>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}

export default RegisterPage;
