import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeToggle } from '../../context/ThemeContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeToggle();
  const navigate = useNavigate();

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navlinks based on User Role
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ];
    }
    
    if (user.role === 'ADMIN') {
      return [
        { label: 'Admin Dashboard', path: '/admin/dashboard' },
        { label: 'Complaints', path: '/admin/dashboard?tab=complaints' },
        { label: 'Agents', path: '/admin/dashboard?tab=agents' },
        { label: 'Users', path: '/admin/dashboard?tab=users' },
      ];
    }

    if (user.role === 'AGENT') {
      return [
        { label: 'Agent Dashboard', path: '/agent/dashboard' },
      ];
    }

    // Role === USER
    return [
      { label: 'Dashboard', path: '/user/dashboard' },
      { label: 'File Complaint', path: '/user/create-complaint' },
    ];
  };

  const navLinks = getNavLinks();

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold', fontFamily: 'Outfit' }}>
        ResolveIt 🛡️
      </Typography>
      <Divider />
      <List>
        {navLinks.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={RouterLink} to={item.path} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: 'none',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 4,
                fontWeight: 800,
                fontFamily: 'Outfit',
                letterSpacing: '.5px',
                color: 'primary.main',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 28 }} />
              ResolveIt
            </Typography>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  color="inherit"
                  sx={{
                    fontWeight: 500,
                    opacity: 0.85,
                    '&:hover': { opacity: 1, backgroundColor: 'rgba(99, 102, 241, 0.08)' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {/* Light/Dark Toggle */}
            <Tooltip title={`Toggle ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Authentication Buttons / Profile */}
            {user ? (
              <Box>
                <Tooltip title="Account Settings">
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 38,
                        height: 38,
                        fontSize: '15px',
                        fontWeight: 'bold',
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: 220,
                      borderRadius: 2,
                      boxShadow: '0px 8px 16px rgba(0,0,0,0.15)',
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box p={2}>
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                    <Box mt={0.5}>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'secondary.main',
                          color: '#fff',
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          fontWeight: 'bold',
                        }}
                      >
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => navigate(user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/user/dashboard')}>
                    <SpaceDashboardIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/profile')}>
                    <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box display="flex" gap={1}>
                <Button component={RouterLink} to="/login" variant="text" color="inherit">
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar;
