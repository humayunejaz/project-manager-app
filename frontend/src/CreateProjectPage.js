import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Box,
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { sendInviteEmail } from './emailService';

function CreateProjectPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_id: localStorage.getItem('customer_id'),
    trip_name: '',
    start_date: '',
    end_date: '',
    group_members: [{ name: '', email: '' }],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGroupChange = (index, field, value) => {
    const updated = [...form.group_members];
    updated[index][field] = value;
    setForm({ ...form, group_members: updated });
  };

  const addGroupMember = () => {
    setForm({
      ...form,
      group_members: [...form.group_members, { name: '', email: '' }],
    });
  };

  const removeGroupMember = (index) => {
    const updated = [...form.group_members];
    updated.splice(index, 1);
    setForm({ ...form, group_members: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/create-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.ok) {
        for (const traveller of form.group_members) {
          await sendInviteEmail(traveller.email, traveller.name, form.trip_name);
        }

        alert('Trip saved and invitation emails sent!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Trip creation failed.');
      }
    } catch (err) {
      console.error('Trip save error:', err);
      alert('An error occurred while saving the trip.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Create New Project
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Trip Name"
          name="trip_name"
          value={form.trip_name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          type="date"
          label="Start Date"
          name="start_date"
          InputLabelProps={{ shrink: true }}
          value={form.start_date}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          type="date"
          label="End Date"
          name="end_date"
          InputLabelProps={{ shrink: true }}
          value={form.end_date}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Typography variant="h6" sx={{ mt: 4 }}>
          Invite Travellers
        </Typography>

        {form.group_members.map((member, index) => (
          <Grid container spacing={2} alignItems="center" key={index}>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Traveller Name"
                value={member.name}
                onChange={(e) =>
                  handleGroupChange(index, 'name', e.target.value)
                }
                required
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Traveller Email"
                value={member.email}
                onChange={(e) =>
                  handleGroupChange(index, 'email', e.target.value)
                }
                required
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton
                onClick={() => removeGroupMember(index)}
                disabled={form.group_members.length === 1}
              >
                <RemoveCircle />
              </IconButton>
              {index === form.group_members.length - 1 && (
                <IconButton onClick={addGroupMember}>
                  <AddCircle />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}

        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" type="submit">
            Save Project
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default CreateProjectPage;
