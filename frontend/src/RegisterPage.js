import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Prefill from email invite link
  const prefillName = searchParams.get('name') || '';
  const prefillEmail = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    first_name: prefillName,
    last_name: '',
    email: prefillEmail,
    password: '',
    address: '',
    phone_number: '',
    travel_interests: '',
    dob: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Registration successful!');
        localStorage.setItem('customer_id', result.customer?.customer_id); // optional
        navigate('/login');
      } else {
        alert(result.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error registering:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleRegister}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Travel Interests"
                name="travel_interests"
                value={formData.travel_interests}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                name="dob"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" fullWidth>
              Register
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button fullWidth onClick={() => navigate('/login')}>
              I already have an account
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}

export default RegisterPage;
