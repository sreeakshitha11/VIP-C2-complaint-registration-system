import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (search) params.search = search;

      const res = await axios.get('/api/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, category, priority]);

  // Debounced search hook or simple keypress search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchComplaints();
    }
  };

  // Status Chip helper
  const getStatusChip = (statusVal) => {
    const configs = {
      PENDING: { label: 'Pending Approval', color: 'warning' },
      ASSIGNED: { label: 'Assigned', color: 'info' },
      IN_PROGRESS: { label: 'In Progress', color: 'secondary' },
      RESOLVED: { label: 'Resolved', color: 'success' },
      REJECTED: { label: 'Rejected', color: 'error' },
    };
    const conf = configs[statusVal] || { label: statusVal, color: 'default' };
    return <Chip label={conf.label} color={conf.color} size="small" sx={{ fontWeight: 'bold' }} />;
  };

  // Priority Chip helper
  const getPriorityChip = (prioVal) => {
    const color = prioVal === 'HIGH' ? 'error' : prioVal === 'MEDIUM' ? 'warning' : 'success';
    return <Chip label={prioVal} color={color} variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />;
  };

  // Dashboard Stats calculations
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <Container maxWidth="lg" className="fade-in" sx={{ py: 6 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Outfit' }}>
            My Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register and monitor your service requests and support tickets.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/user/create-complaint"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ py: 1.2, px: 2.5 }}
        >
          Register Complaint
        </Button>
      </Box>

      {/* Cards Statistics Row */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.main', color: '#fff' }}>
            <CardContent display="flex" flexDirection="column" sx={{ position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                TOTAL TICKETS
              </Typography>
              {loading ? (
                <Skeleton width="40%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h3" fontWeight="bold" my={1}>
                  {totalCount}
                </Typography>
              )}
              <ListAltIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, opacity: 0.2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.main', color: '#fff' }}>
            <CardContent display="flex" flexDirection="column" sx={{ position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                ACTIVE TICKETS
              </Typography>
              {loading ? (
                <Skeleton width="40%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h3" fontWeight="bold" my={1}>
                  {pendingCount}
                </Typography>
              )}
              <HourglassEmptyIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, opacity: 0.2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.main', color: '#fff' }}>
            <CardContent display="flex" flexDirection="column" sx={{ position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                RESOLVED TICKETS
              </Typography>
              {loading ? (
                <Skeleton width="40%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h3" fontWeight="bold" my={1}>
                  {resolvedCount}
                </Typography>
              )}
              <CheckCircleOutlineIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, opacity: 0.2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search complaints..."
              placeholder="Press Enter to search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending Approval</MenuItem>
              <MenuItem value="ASSIGNED">Assigned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Billing">Billing</MenuItem>
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="General">General</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="outlined" fullWidth size="medium" onClick={() => { setSearch(''); setStatus(''); setCategory(''); setPriority(''); fetchComplaints(); }}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Complaints Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(3)).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                </TableRow>
              ))
            ) : complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    No complaints registered. Click "Register Complaint" to file a ticket.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((complaint) => (
                <TableRow key={complaint._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{complaint.title}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>{getPriorityChip(complaint.priority)}</TableCell>
                  <TableCell>{getStatusChip(complaint.status)}</TableCell>
                  <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/complaints/${complaint._id}`}
                      variant="text"
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Track Ticket
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserDashboard;
