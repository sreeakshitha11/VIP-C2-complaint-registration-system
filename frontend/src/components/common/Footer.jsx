import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? '#0b0f19' : '#f1f5f9',
        borderTop: (theme) =>
          theme.palette.mode === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          textAlign={{ xs: 'center', md: 'left' }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ fontFamily: 'Outfit' }}>
              🛡️ ResolveIt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Secure, role-based complaint registration and management system.
            </Typography>
          </Box>
          <Box display="flex" gap={3}>
            <Link href="/" color="text.secondary" underline="hover" variant="body2">
              Home
            </Link>
            <Link href="/about" color="text.secondary" underline="hover" variant="body2">
              About Us
            </Link>
            <Link href="/contact" color="text.secondary" underline="hover" variant="body2">
              Contact
            </Link>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="/" underline="hover">
            ResolveIt
          </Link>{' '}
          {new Date().getFullYear()}
          {'. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
