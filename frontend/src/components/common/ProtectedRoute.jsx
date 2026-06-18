import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box, Typography, Button, Container, Paper } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
      >
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          Verifying authorization...
        </Typography>
      </Box>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Pending agent approval page override
  if (user.role === 'AGENT' && !user.isApprovedAgent) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <LockOpenIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Approval Pending
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for registering as an Agent. Your account details have been recorded, but an administrator must approve your account before you can view assigned complaints.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} mt={3}>
            <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
            <Button variant="outlined" color="error" onClick={logout}>
              Sign Out
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Authenticated but does not have permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default ProtectedRoute;
