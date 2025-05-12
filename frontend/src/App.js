import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import CreateProjectPage from './CreateProjectPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProjectPage />} />
        <Route path="/" element={<RegisterPage />} /> {/* Optional default */}
      </Routes>
    </Router>
  );
}

export default App;
