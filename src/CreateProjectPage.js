import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, IconButton, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from './supabase';
import emailjs from 'emailjs-com';

function CreateProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [countries, setCountries] = useState([]);
  const [citiesByCountry, setCitiesByCountry] = useState({});
  const [travelers, setTravelers] = useState([]);
  const [error, setError] = useState('');

  const availableCountries = ['Canada', 'USA', 'UK'];
  const availableCities = {
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    USA: ['New York', 'Los Angeles', 'Chicago'],
    UK: ['London', 'Manchester', 'Liverpool'],
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setError('Not logged in');
      return;
    }

    // Save project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{
        owner_id: userId,
        project_name: projectName,
        start_date: startDate,
        end_date: endDate,
        countries,
        cities: citiesByCountry
      }])
      .select()
      .single();

    if (projectError) {
      setError(projectError.message);
      return;
    }

    // Save invitations and send email
    for (const t of travelers) {
      await supabase.from('invitations').insert([{
        project_id: projectData.id,
        invited_email: t.email,
        name: t.name,
        status: 'pending'
      }]);

      // Send invite email to traveler using EmailJS
      emailjs.send(
        'service_7gpzfjq',       // ✅ your service ID
        'template_dl2uq6v',      // ✅ your template ID
        {
          name: t.name,
          project_name: projectName,
          project_id: projectData.id,
          invited_email: t.email,
          user_email: t.email     // ✅ the key EmailJS uses to send email
        },
        'QlIA9_4mrMcOxdFcK'       // ✅ your public key
      ).then(
        (response) => console.log('✅ Email sent to', t.email, ':', response.status),
        (err) => console.error('❌ Email error for', t.email, ':', err)
      );
    }

    alert('Project and invitations saved!');
    setProjectName('');
    setStartDate('');
    setEndDate('');
    setCountries([]);
    setCitiesByCountry({});
    setTravelers([]);
  };

  const handleTravelerChange = (index, field, value) => {
    const updated = [...travelers];
    updated[index][field] = value;
    setTravelers(updated);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>Create New Project</Typography>
        <form onSubmit={handleSave}>
          <TextField
            label="Project Name"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Countries</InputLabel>
            <Select
              multiple
              value={countries}
              onChange={(e) => {
                const selected = e.target.value;
                setCountries(selected);
                const newCities = { ...citiesByCountry };
                selected.forEach(c => {
                  if (!newCities[c]) newCities[c] = [];
                });
                Object.keys(newCities).forEach(c => {
                  if (!selected.includes(c)) delete newCities[c];
                });
                setCitiesByCountry(newCities);
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

          {countries.map((country) => (
            <FormControl fullWidth key={country} sx={{ mb: 2 }}>
              <InputLabel>{`Cities in ${country}`}</InputLabel>
              <Select
                multiple
                value={citiesByCountry[country] || []}
                onChange={(e) => {
                  const selected = e.target.value;
                  setCitiesByCountry(prev => ({ ...prev, [country]: selected }));
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

          <Typography variant="h6" sx={{ mt: 4 }}>Invite Travelers</Typography>
          {travelers.map((t, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
              <TextField
                label="Name"
                value={t.name}
                onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
              />
              <TextField
                label="Email"
                value={t.email}
                onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
              />
              <IconButton color="error" onClick={() => {
                const updated = [...travelers];
                updated.splice(index, 1);
                setTravelers(updated);
              }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setTravelers([...travelers, { name: '', email: '' }])}>
            + Add Traveler
          </Button>

          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <Button variant="contained" type="submit" sx={{ mt: 3 }}>Save Project</Button>
        </form>
      </Box>
    </Container>
  );
}

export default CreateProjectPage;
