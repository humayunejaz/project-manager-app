import { useState } from 'react';
import {
  TextField, MenuItem, Select, InputLabel, FormControl, Chip, Box, Typography,
  Button, IconButton, Paper, Container
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ijqfuoriewstwhhziazx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcWZ1b3JpZXdzdHdoaHppYXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTQ1NjQsImV4cCI6MjA2MTE3MDU2NH0.Or8TT1AMkaDaeBFWpPkH--vQx96MnLJMzpUAvv-ukjc');

function CreateProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [countries, setCountries] = useState([]);
  const [citiesByCountry, setCitiesByCountry] = useState({});
  const [travelers, setTravelers] = useState([]);
  const [errors, setErrors] = useState({});

  const availableCountries = ['Canada', 'USA', 'United Kingdom', 'Germany', 'France'];
  const availableCities = {
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    USA: ['New York', 'Los Angeles', 'Chicago'],
    'United Kingdom': ['London', 'Manchester'],
    Germany: ['Berlin', 'Munich'],
    France: ['Paris', 'Lyon']
  };

  const handleCountriesChange = (e) => {
    const selected = e.target.value;
    if (selected.length <= 10) {
      setCountries(selected);
      const updatedCities = { ...citiesByCountry };
      selected.forEach(c => updatedCities[c] = updatedCities[c] || []);
      Object.keys(updatedCities).forEach(c => {
        if (!selected.includes(c)) delete updatedCities[c];
      });
      setCitiesByCountry(updatedCities);
    } else {
      setErrors(prev => ({ ...prev, countries: 'Max 10 countries' }));
    }
  };

  const handleTravelerChange = (index, field, value) => {
    const updated = [...travelers];
    updated[index][field] = value;
    setTravelers(updated);
  };

  const validateForm = () => {
    const errs = {};
    if (!projectName) errs.projectName = 'Required';
    if (!startDate) errs.startDate = 'Required';
    if (!endDate) errs.endDate = 'Required';
    if (startDate && endDate && startDate > endDate)
      errs.endDate = 'End must be after start';
    if (countries.length === 0) errs.countries = 'Select at least one';
    travelers.forEach((t, i) => {
      if (!t.name || !t.email || !t.role) errs[`traveler-${i}`] = 'Complete all fields';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const project = {
      project_name: projectName,
      start_date: startDate,
      end_date: endDate,
      countries,
      cities: citiesByCountry,
      travelers
    };
    const { error } = await supabase.from('projects').insert([project]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✅ Project saved!');
      setProjectName('');
      setStartDate('');
      setEndDate('');
      setCountries([]);
      setCitiesByCountry({});
      setTravelers([]);
      setErrors({});
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>Create a New Project</Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              error={!!errors.projectName}
              helperText={errors.projectName}
            />

            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={!!errors.startDate}
              helperText={errors.startDate}
            />

            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={!!errors.endDate}
              helperText={errors.endDate}
            />

            <FormControl error={!!errors.countries}>
              <InputLabel>Countries</InputLabel>
              <Select
                multiple
                value={countries}
                onChange={handleCountriesChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} />)}
                  </Box>
                )}
              >
                {availableCountries.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
              {errors.countries && <Typography color="error" fontSize="small">{errors.countries}</Typography>}
            </FormControl>

            {countries.map((country) => (
              <FormControl key={country}>
                <InputLabel>{`Cities in ${country}`}</InputLabel>
                <Select
                  multiple
                  value={citiesByCountry[country] || []}
                  onChange={(e) =>
                    setCitiesByCountry(prev => ({ ...prev, [country]: e.target.value }))
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((city) => <Chip key={city} label={city} />)}
                    </Box>
                  )}
                >
                  {availableCities[country].map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            <Typography variant="h6" mt={2}>Travelers</Typography>
            {travelers.map((traveler, i) => (
              <Box key={i} display="flex" gap={1} alignItems="center">
                <TextField
                  label="Name"
                  value={traveler.name}
                  onChange={(e) => handleTravelerChange(i, 'name', e.target.value)}
                  error={!!errors[`traveler-${i}`]}
                />
                <TextField
                  label="Email"
                  value={traveler.email}
                  onChange={(e) => handleTravelerChange(i, 'email', e.target.value)}
                  error={!!errors[`traveler-${i}`]}
                />
                <TextField
                  label="Role"
                  value={traveler.role}
                  onChange={(e) => handleTravelerChange(i, 'role', e.target.value)}
                  error={!!errors[`traveler-${i}`]}
                />
                <IconButton onClick={() => {
                  const updated = [...travelers];
                  updated.splice(i, 1);
                  setTravelers(updated);
                }} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button variant="outlined" onClick={() =>
              setTravelers([...travelers, { name: '', email: '', role: '' }])
            }>
              Add Traveler
            </Button>

            <Button type="submit" variant="contained">Save Project</Button>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default CreateProjectPage;
