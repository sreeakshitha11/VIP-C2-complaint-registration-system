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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { toast } from 'react-toastify';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
    specialization: '',
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Prepare payload (only send specialization if role is AGENT)
    const payload = { ...formData };
    if (payload.role !== 'AGENT') {
      delete payload.specialization;
    } else if (!payload.specialization) {
      setErrorMsg('Specialization is required for Agent registration');
      setIsSubmitting(false);
      return;
    }

    const result = await register(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Registration successful!');
      if (formData.role === 'AGENT') {
        toast.info('Your agent account is pending administrator approval.');
      }
      // Redirection is handled by the useEffect
    } else {
      setErrorMsg(result.message);
      toast.error(result.message);
    }
  };

  return (
    <Container maxWidth="xs" className="fade-in" sx={{ mt: 6, mb: 10 }}>
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
          <PersonAddOutlinedIcon />
        </Box>
        <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Sign Up
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
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password (min. 6 characters)"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
          />

          <FormControl component="fieldset" sx={{ mt: 2, mb: 1, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              Register As:
            </FormLabel>
            <RadioGroup row name="role" value={formData.role} onChange={handleChange}>
              <FormControlLabel value="USER" control={<Radio />} label="Standard User" />
              <FormControlLabel value="AGENT" control={<Radio />} label="Service Agent" />
            </RadioGroup>
          </FormControl>

          {/* Conditional field for Agent Specialization */}
          <Collapse in={formData.role === 'AGENT'} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required={formData.role === 'AGENT'}
              fullWidth
              id="specialization"
              label="Agent Specialization (e.g. Billing, Technical)"
              name="specialization"
              placeholder="e.g. Database Support, Payment gateway"
              value={formData.specialization}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
          </Collapse>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, py: 1.2 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
          <Box display="flex" justifyContent="center">
            <Link component={RouterLink} to="/login" variant="body2">
              {'Already have an account? Sign In'}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
