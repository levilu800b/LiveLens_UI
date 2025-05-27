import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/Homepage/HomePage';
// import PropertiesPage from './pages/Properties/PropertiesPage';
// import ProjectsPage from './pages/Projects/ProjectsPage';
// import LoginPage from './pages/Login/LoginPage';
// import RegisterPage from './pages/Register/RegisterPage';
// import ServicesPage from './pages/Services/ServicesPage';

function App() {

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/services" element={<ServicesPage />} /> */}
      </Routes>
    </div>
  )
}

export default App