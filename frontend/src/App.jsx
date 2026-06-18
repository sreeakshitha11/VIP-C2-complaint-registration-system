import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';

// Shared Protected Pages
import ComplaintDetails from './pages/ComplaintDetails';
import Profile from './pages/Profile';

// Role-specific Pages
import UserDashboard from './pages/user/UserDashboard';
import CreateComplaint from './pages/user/CreateComplaint';
import AgentDashboard from './pages/agent/AgentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import { Box } from '@mui/material';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Box display="flex" flexDirection="column" minHeight="100vh">
              {/* Header Navigation */}
              <Navbar />

              {/* Main Content Area */}
              <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                  {/* Public Paths */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Shared Protected Paths */}
                  <Route element={<ProtectedRoute allowedRoles={['USER', 'AGENT', 'ADMIN']} />}>
                    <Route path="/complaints/:id" element={<ComplaintDetails />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>

                  {/* User Dashboard Paths */}
                  <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                    <Route path="/user/dashboard" element={<UserDashboard />} />
                    <Route path="/user/create-complaint" element={<CreateComplaint />} />
                  </Route>

                  {/* Agent Workspace Paths */}
                  <Route element={<ProtectedRoute allowedRoles={['AGENT']} />}>
                    <Route path="/agent/dashboard" element={<AgentDashboard />} />
                  </Route>

                  {/* Admin Console Paths */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  </Route>

                  {/* Catch-all Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>

              {/* Footer */}
              <Footer />
            </Box>
            <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
