import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Box,
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const customer_id = localStorage.getItem('customer_id');

  useEffect(() => {
    if (!customer_id) {
      alert('User not logged in. Please login first.');
      return;
    }
    fetch(`http://localhost:5000/trips-with-members/${customer_id}`)
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => console.error('Error fetching trips:', err));
  }, [customer_id]);

  const handleDelete = async (trip_id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      const res = await fetch(`http://localhost:5000/trips/${trip_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.trip_id !== trip_id));
      } else {
        alert('Failed to delete trip.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleEditOpen = (trip) => {
    setEditingTrip({ ...trip });
    setOpenDialog(true);
  };

  const handleEditChange = (field, value) => {
    setEditingTrip((prev) => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...editingTrip.group_members];
    updated[index][field] = value;
    setEditingTrip({ ...editingTrip, group_members: updated });
  };

  const addMember = () => {
    setEditingTrip((prev) => ({
      ...prev,
      group_members: [...prev.group_members, { name: '', email: '' }],
    }));
  };

  const removeMember = (index) => {
    const updated = [...editingTrip.group_members];
    updated.splice(index, 1);
    setEditingTrip({ ...editingTrip, group_members: updated });
  };

  const handleEditSave = async () => {
    const response = await fetch(`http://localhost:5000/trips/${editingTrip.trip_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTrip),
    });

    const result = await response.json();

    if (response.ok) {
      setTrips((prev) =>
        prev.map((t) => (t.trip_id === editingTrip.trip_id ? editingTrip : t))
      );
      setOpenDialog(false);
    } else {
      alert(result.error || 'Failed to update trip.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Your Projects</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-project')}
        >
          Create New Project
        </Button>
      </Box>

      {trips.map((trip) => (
        <Card key={trip.trip_id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {trip.trip_name}
            </Typography>
            <Typography variant="body2">
              <strong>Dates:</strong> {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Invited Travellers:</strong>
              {trip.group_members.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {trip.group_members.map((m, i) => (
                    <li key={i}>
                      {m.name} ({m.email})
                    </li>
                  ))}
                </ul>
              ) : (
                <span> None</span>
              )}
            </Typography>

            <Button onClick={() => handleEditOpen(trip)} variant="outlined" sx={{ mr: 1 }}>
              Edit
            </Button>
            <Button onClick={() => handleDelete(trip.trip_id)} color="error" variant="outlined">
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Trip Name"
            variant="outlined"
            sx={{ mb: 2 }}
            value={editingTrip?.trip_name || ''}
            onChange={(e) => handleEditChange('trip_name', e.target.value)}
          />
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={editingTrip?.start_date?.split('T')[0] || ''}
            onChange={(e) => handleEditChange('start_date', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={editingTrip?.end_date?.split('T')[0] || ''}
            onChange={(e) => handleEditChange('end_date', e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Travellers
          </Typography>
          {editingTrip?.group_members?.map((member, index) => (
            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Email"
                  value={member.email}
                  onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => removeMember(index)}>
                  <RemoveCircle />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            startIcon={<AddCircle />}
            onClick={addMember}
            sx={{ mt: 1 }}
            variant="outlined"
          >
            Add Traveller
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
