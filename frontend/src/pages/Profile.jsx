import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.warn('Please fill in all details');
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({ name, email, phone });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Container maxWidth="sm" className="fade-in" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <AccountCircleIcon sx={{ fontSize: 70, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'Outfit' }}>
            My Profile Settings
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: <b>{user?.role}</b>
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 4, py: 1.2 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
