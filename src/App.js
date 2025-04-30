import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import CreateProjectPage from './CreateProjectPage';
import { Button, Container, Typography } from '@mui/material';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>Project Manager</Typography>
      <Typography variant="body1" gutterBottom>
        Create and manage travel-based projects with ease.
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/create-project')}>
        Create New Project
      </Button>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-project" element={<CreateProjectPage />} />
      </Routes>
    </Router>
  );
}

export default App;
