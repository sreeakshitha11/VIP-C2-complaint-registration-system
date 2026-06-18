import React, { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, Grid } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { toast } from 'react-toastify';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for contacting us! We will get back to you shortly.');
    setName('');
    setEmail('');
    setMsg('');
  };

  return (
    <Container maxWidth="md" className="fade-in" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: 'Outfit' }}>
              Get in Touch
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
              Have questions about platform integration or need enterprise tier ticketing workflows? Reach out to our system specialists.
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <MailOutlineIcon color="primary" />
              <Typography variant="body2">support@resolveit.com</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <PhoneIcon color="primary" />
              <Typography variant="body2">+1 (800) 555-0199</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <LocationOnIcon color="primary" />
              <Typography variant="body2">100 Pine Street, San Francisco, CA</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3 }} component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Send a Message
            </Typography>
            <TextField
              fullWidth
              required
              label="Name"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Message"
              margin="normal"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, py: 1 }}>
              Submit Inquiry
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
