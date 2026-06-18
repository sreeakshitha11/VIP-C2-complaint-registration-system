import React from 'react';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import GroupsIcon from '@mui/icons-material/Groups';

const About = () => {
  return (
    <Container maxWidth="md" className="fade-in" sx={{ py: 8 }}>
      <Paper sx={{ p: 5, borderRadius: 3 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" align="center" sx={{ fontFamily: 'Outfit', color: 'primary.main' }}>
          About ResolveIt
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center" sx={{ fontSize: '1.1rem', mb: 4 }}>
          ResolveIt is a secure, role-based complaint registration and ticketing portal designed to handle concerns efficiently across users, handling agents, and system administrators.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" p={2}>
              <IntegrationInstructionsIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                The Tech Stack
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Built using the MERN Stack (React, Node, Express, MongoDB). Backed by JWT access security, Helmet defenses, real-time Socket.IO chat rooms, and automated Nodemailer notification triggers.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" p={2}>
              <GroupsIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Role Delegation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users submit tickets and track timelines; Agents process assignments and compile resolutions; Admins manage approvals, distribute jobs, and analyze graphs.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default About;
