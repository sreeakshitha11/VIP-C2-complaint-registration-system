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
  Skeleton,
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { toast } from 'react-toastify';

const AgentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
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
    fetchAssignedComplaints();
  }, [status, priority]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchAssignedComplaints();
    }
  };

  // Stats calculation
  const totalAssigned = complaints.length;
  const activeCount = complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  const getStatusChip = (statusVal) => {
    const configs = {
      ASSIGNED: { label: 'Assigned', color: 'info' },
      IN_PROGRESS: { label: 'In Progress', color: 'secondary' },
      RESOLVED: { label: 'Resolved', color: 'success' },
      REJECTED: { label: 'Rejected', color: 'error' },
    };
    const conf = configs[statusVal] || { label: statusVal, color: 'default' };
    return <Chip label={conf.label} color={conf.color} size="small" sx={{ fontWeight: 'bold' }} />;
  };

  const getPriorityChip = (prioVal) => {
    const color = prioVal === 'HIGH' ? 'error' : prioVal === 'MEDIUM' ? 'warning' : 'success';
    return <Chip label={prioVal} color={color} variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />;
  };

  return (
    <Container maxWidth="lg" className="fade-in" sx={{ py: 6 }}>
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Outfit' }}>
          Agent Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and resolve tickets assigned to your queue. Update statuses and chat with clients.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.main', color: '#fff' }}>
            <CardContent display="flex" flexDirection="column" sx={{ position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                TOTAL HANDLED
              </Typography>
              {loading ? (
                <Skeleton width="40%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h3" fontWeight="bold" my={1}>
                  {totalAssigned}
                </Typography>
              )}
              <ListAltIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, opacity: 0.2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'secondary.main', color: '#fff' }}>
            <CardContent display="flex" flexDirection="column" sx={{ position: 'relative' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                ACTIVE TICKETS
              </Typography>
              {loading ? (
                <Skeleton width="40%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h3" fontWeight="bold" my={1}>
                  {activeCount}
                </Typography>
              )}
              <PendingActionsIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, opacity: 0.2 }} />
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

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              label="Search keyword..."
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
          <Grid item xs={12} sm={4} md={3}>
            <Button variant="outlined" fullWidth size="medium" onClick={() => { setSearch(''); setStatus(''); setPriority(''); fetchAssignedComplaints(); }}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tickets List */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Client Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned On</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(3)).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell><Skeleton width="70%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                </TableRow>
              ))
            ) : complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    No tickets assigned. Keep checking back!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((complaint) => (
                <TableRow key={complaint._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{complaint.userId?.name}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{complaint.title}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>{getPriorityChip(complaint.priority)}</TableCell>
                  <TableCell>{getStatusChip(complaint.status)}</TableCell>
                  <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/complaints/${complaint._id}`}
                      variant="contained"
                      size="small"
                      color="primary"
                    >
                      Process Ticket
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

export default AgentDashboard;
