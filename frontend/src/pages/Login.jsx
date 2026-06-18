import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { toast } from 'react-toastify';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/user/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Signed in successfully!');
      // Redirection is handled by the useEffect
    } else {
      setErrorMsg(result.message);
      toast.error(result.message);
    }
  };

  return (
    <Container maxWidth="xs" className="fade-in" sx={{ mt: 10, mb: 10 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            m: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockOutlinedIcon />
        </Box>
        <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Sign In
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, py: 1.2 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Link component={RouterLink} to="/register" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Paper>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed #6366f1' }}>
        <Typography variant="caption" display="block" fontWeight="bold" gutterBottom color="primary.main">
          🔐 Test Accounts (Password: password123):
        </Typography>
        <Typography variant="caption" display="block">
          • <b>Admin:</b> admin@complaint.com
        </Typography>
        <Typography variant="caption" display="block">
          • <b>Approved Agent:</b> agent1@complaint.com
        </Typography>
        <Typography variant="caption" display="block">
          • <b>Standard User:</b> user@complaint.com
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
