import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function LoginPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const invitedProjectId = query.get('project_id');
  const invitedEmail = query.get('email');

  const [email, setEmail] = useState(invitedEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (invitedProjectId) {
      localStorage.setItem('invited_project_id', invitedProjectId);
    }
  }, [invitedProjectId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <form onSubmit={handleLogin}>
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
          <Button variant="contained" type="submit">Login</Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Register here
            </span>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}

export default LoginPage;
