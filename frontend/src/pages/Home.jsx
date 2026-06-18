import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  useTheme,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Home = () => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <Box className="fade-in">
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 14 },
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontFamily: 'Outfit',
              background: 'linear-gradient(to right, #6366f1, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Resolve Issues Swiftly & Transparantly
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            A high-performance online complaint registration and ticketing management platform. Securely log, route, track, and resolve system issues in real time.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            {user ? (
              <Button
                component={RouterLink}
                to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/user/dashboard'}
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  color="inherit"
                  size="large"
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          fontWeight="bold"
          sx={{ fontFamily: 'Outfit', mb: 6 }}
        >
          Key Platform Advantages
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <SecurityIcon fontSize="large" sx={{ color: '#6366f1' }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  Role-Based Security
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Strict authorization boundaries secure all actions. Dedicated views and credentials protect client files and agent workloads.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText',
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <SpeedIcon fontSize="large" sx={{ color: '#14b8a6' }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  Real-time Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Track complaint status changes live as processing progresses. Automatic updates are reflected instantly in user timelines.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <QuestionAnswerIcon fontSize="large" sx={{ color: '#6366f1' }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  Live Agent Chat
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Resolve doubts without leaving the portal. Engage in live, room-based chats backed by Socket.IO with your assigned processor.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
