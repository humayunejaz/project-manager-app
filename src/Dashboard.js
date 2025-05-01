import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Container, Box, Divider, CircularProgress, Paper, List, ListItem, ListItemText,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

function Dashboard() {
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [invitedProjects, setInvitedProjects] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editFields, setEditFields] = useState({
    project_name: '',
    start_date: '',
    end_date: '',
    countries: [],
    cities: {},
    travelers: []
  });

  const availableCountries = ['Canada', 'USA', 'UK'];
  const availableCities = {
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    USA: ['New York', 'Los Angeles', 'Chicago'],
    UK: ['London', 'Manchester', 'Liverpool']
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        navigate('/login');
        return;
      }

      setUserEmail(user.email);

      const { data: owned } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);

      setOwnedProjects(owned || []);

      const { data: invites } = await supabase
        .from('invitations')
        .select('project_id')
        .eq('invited_email', user.email);

      const projectIds = invites.map(i => i.project_id);
      let invited = [];

      if (projectIds.length > 0) {
        const { data: invitedProjects } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);

        invited = invitedProjects || [];
      }

      setInvitedProjects(invited);
      setLoading(false);
    };

    fetchProjects();
  }, [navigate]);

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm('Are you sure you want to delete this project?');
    if (!confirmed) return;

    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (!error) {
      setOwnedProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const openEditDialog = async (project) => {
    setProjectToEdit(project);
    const { data: travelers } = await supabase
      .from('invitations')
      .select('*')
      .eq('project_id', project.id);

    setEditFields({
      project_name: project.project_name,
      start_date: project.start_date,
      end_date: project.end_date,
      countries: project.countries || [],
      cities: project.cities || {},
      travelers: travelers || []
    });
    setEditDialogOpen(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    const { project_name, start_date, end_date, countries, cities, travelers } = editFields;

    const { error } = await supabase
      .from('projects')
      .update({ project_name, start_date, end_date, countries, cities })
      .eq('id', projectToEdit.id);

    if (error) {
      alert('Failed to update project');
      return;
    }

    // Get existing invitations
    const { data: existing } = await supabase
      .from('invitations')
      .select('*')
      .eq('project_id', projectToEdit.id);

    const existingEmails = new Set(existing.map(i => i.invited_email));
    const updatedEmails = new Set(travelers.map(t => t.invited_email));

    // Insert or update travelers
    for (const t of travelers) {
      const existingTraveler = existing.find(e => e.invited_email === t.invited_email);
      if (existingTraveler) {
        await supabase.from('invitations').update({
          name: t.name
        }).eq('id', existingTraveler.id);
      } else {
        await supabase.from('invitations').insert({
          project_id: projectToEdit.id,
          name: t.name,
          invited_email: t.invited_email,
          status: 'pending'
        });
      }
    }

    // Delete removed travelers
    for (const e of existing) {
      if (!updatedEmails.has(e.invited_email)) {
        await supabase.from('invitations').delete().eq('id', e.id);
      }
    }

    setOwnedProjects(prev =>
      prev.map(p =>
        p.id === projectToEdit.id ? { ...p, project_name, start_date, end_date, countries, cities } : p
      )
    );

    alert('Project updated');
    setEditDialogOpen(false);
  };

  const handleTravelerChange = (index, field, value) => {
    const updated = [...editFields.travelers];
    updated[index][field] = value;
    setEditFields(prev => ({ ...prev, travelers: updated }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4">Your Dashboard</Typography>
      <Typography sx={{ mb: 3 }}>Logged in as: <strong>{userEmail}</strong></Typography>

      <Box sx={{ mb: 4 }}>
        <Button variant="contained" onClick={() => navigate('/create-project')}>
          + Create New Project
        </Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6">Your Projects</Typography>
            <Divider sx={{ mb: 1 }} />
            {ownedProjects.length === 0 ? (
              <Typography>No projects yet.</Typography>
            ) : (
              <List>
                {ownedProjects.map((project) => (
                  <ListItem
                    key={project.id}
                    secondaryAction={
                      <>
                        <IconButton onClick={() => openEditDialog(project)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(project.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={project.project_name}
                      secondary={`Start: ${project.start_date} — End: ${project.end_date}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Invited Projects</Typography>
            <Divider sx={{ mb: 1 }} />
            <List>
              {invitedProjects.map((p) => (
                <ListItem key={p.id}>
                  <ListItemText primary={p.project_name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      {/* EDIT MODAL */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            fullWidth
            margin="normal"
            value={editFields.project_name}
            onChange={(e) => handleEditFieldChange('project_name', e.target.value)}
          />
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editFields.start_date}
            onChange={(e) => handleEditFieldChange('start_date', e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editFields.end_date}
            onChange={(e) => handleEditFieldChange('end_date', e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Countries</InputLabel>
            <Select
              multiple
              value={editFields.countries}
              onChange={(e) => {
                const selected = e.target.value;
                const newCities = { ...editFields.cities };
                selected.forEach((c) => {
                  if (!newCities[c]) newCities[c] = [];
                });
                Object.keys(newCities).forEach((c) => {
                  if (!selected.includes(c)) delete newCities[c];
                });
                setEditFields((prev) => ({ ...prev, countries: selected, cities: newCities }));
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selected.map((value) => <Chip key={value} label={value} />)}
                </Box>
              )}
            >
              {availableCountries.map((country) => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {editFields.countries.map((country) => (
            <FormControl fullWidth sx={{ mt: 2 }} key={country}>
              <InputLabel>{`Cities in ${country}`}</InputLabel>
              <Select
                multiple
                value={editFields.cities[country] || []}
                onChange={(e) => {
                  const selected = e.target.value;
                  setEditFields(prev => ({
                    ...prev,
                    cities: { ...prev.cities, [country]: selected }
                  }));
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selected.map((value) => <Chip key={value} label={value} />)}
                  </Box>
                )}
              >
                {(availableCities[country] || []).map((city) => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Travelers</Typography>
            {editFields.travelers.map((t, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, my: 1 }}>
                <TextField
                  label="Name"
                  value={t.name}
                  onChange={(e) => handleTravelerChange(i, 'name', e.target.value)}
                />
                <TextField
                  label="Email"
                  value={t.invited_email}
                  onChange={(e) => handleTravelerChange(i, 'invited_email', e.target.value)}
                />
                <IconButton color="error" onClick={() => {
                  const updated = [...editFields.travelers];
                  updated.splice(i, 1);
                  setEditFields(prev => ({ ...prev, travelers: updated }));
                }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => setEditFields(prev => ({
              ...prev,
              travelers: [...prev.travelers, { name: '', invited_email: '' }]
            }))}>
              + Add Traveler
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
