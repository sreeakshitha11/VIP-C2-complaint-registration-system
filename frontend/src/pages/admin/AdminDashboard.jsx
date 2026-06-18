import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { toast } from 'react-toastify';

// Colors for Pie Charts
const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'analytics';

  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all administrative datasets
  const loadAdminData = async () => {
    try {
      setLoading(true);
      // Run concurrent requests for dashboard items
      const [resAnal, resCompl, resAgents, resUsers] = await Promise.all([
        axios.get('/api/analytics'),
        axios.get('/api/complaints'),
        axios.get('/api/agents'),
        axios.get('/api/users'),
      ]);

      if (resAnal.data.success) setAnalytics(resAnal.data.data);
      if (resCompl.data.success) setComplaints(resCompl.data.data);
      if (resAgents.data.success) setAgents(resAgents.data.data);
      if (resUsers.data.success) setUsers(resUsers.data.data);

    } catch (err) {
      toast.error('Failed to retrieve server logs and metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue });
  };

  // Agent approvals approval update
  const handleApproveAgent = async (agentId, approve) => {
    try {
      const res = await axios.put(`/api/agents/${agentId}/approve`, { approve });
      if (res.data.success) {
        toast.success(res.data.message);
        loadAdminData(); // reload statistics
      }
    } catch (err) {
      toast.error('Agent approval toggle failed');
    }
  };

  // Export system PDF report
  const handleExportPDF = () => {
    if (complaints.length === 0) {
      toast.warn('No complaints to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ResolveIt | System Complaints Overview', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(`Total Records: ${complaints.length}`, 14, 31);

    const tableColumn = ["Client", "Title", "Category", "Priority", "Status", "Agent Assigned", "Filed Date"];
    const tableRows = [];

    complaints.forEach((ticket) => {
      const rowData = [
        ticket.userId?.name || 'N/A',
        ticket.title,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.assignedAgent?.name || 'Unassigned',
        new Date(ticket.createdAt).toLocaleDateString(),
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 37,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }, // Brand primary Indigo
      styles: { fontSize: 8 },
    });

    doc.save(`resolveit-audit-report-${Date.now()}.pdf`);
    toast.success('System report compiled to PDF!');
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

  const getPriorityChip = (prioVal) => {
    const color = prioVal === 'HIGH' ? 'error' : prioVal === 'MEDIUM' ? 'warning' : 'success';
    return <Chip label={prioVal} color={color} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
  };

  if (loading || !analytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  const { summary, charts, recentLogs } = analytics;

  return (
    <Container maxWidth="lg" className="fade-in" sx={{ py: 6 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Outfit' }}>
            System Administration Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users, evaluate support queues, authorize agents, and query system charts.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<GetAppIcon />} onClick={handleExportPDF}>
          Export PDF Summary
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab value="analytics" label="Analytics & Logs" />
          <Tab value="complaints" label="Complaints Queue" />
          <Tab value="agents" label="Agents Management" />
          <Tab value="users" label="User Registry" />
        </Tabs>
      </Box>

      {/* Tab Panels */}

      {/* 1. Analytics & Logs */}
      {currentTab === 'analytics' && (
        <Box className="fade-in">
          {/* Summary counters grid */}
          <Grid container spacing={3} mb={5}>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.totalComplaints}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Complaints
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {summary.pendingComplaints}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending Assign
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', borderColor: 'info.main' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {summary.inProgressComplaints + summary.assignedComplaints}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Handled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {summary.resolvedComplaints}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Resolved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={4} mb={5}>
            {/* Monthly Trend Area Chart */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  Monthly Complaint Trend (Last 6 Months)
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.monthlyTrend}>
                      <defs>
                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip />
                      <Area type="monotone" dataKey="complaints" stroke="#6366f1" fillOpacity={1} fill="url(#colorComplaints)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Category Pie Chart */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Complaints by Category
                </Typography>
                <Box height={300} display="flex" flexDirection="column" justifyContent="center">
                  {charts.categoryBreakdown.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">No data recorded</Typography>
                  ) : (
                    <Box display="flex" flex={1}>
                      <ResponsiveContainer width="60%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={charts.categoryBreakdown}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {charts.categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <Box display="flex" flexDirection="column" justifyContent="center" gap={1} width="40%">
                        {charts.categoryBreakdown.map((item, idx) => (
                          <Box key={item.name} display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length] }} />
                            <Typography variant="caption" noWrap fontWeight="bold">
                              {item.name}: {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Activity Logs */}
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Audit Logs (Recent Activity)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{log.userId?.name || 'System / Guest'}</TableCell>
                      <TableCell>
                        {log.userId ? (
                          <Chip label={log.userId.role} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold', scale: '0.9' }} />
                        ) : (
                          '--'
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* 2. Complaints Queue */}
      {currentTab === 'complaints' && (
        <TableContainer component={Paper} className="fade-in" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assigned Agent</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    No system complaints recorded.
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((c) => (
                  <TableRow key={c._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{c.userId?.name}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{c.title}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{getPriorityChip(c.priority)}</TableCell>
                    <TableCell>{getStatusChip(c.status)}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{c.assignedAgent?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/complaints/${c._id}`}
                        variant="contained"
                        size="small"
                        color="primary"
                      >
                        Inspect & Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 3. Agents Management */}
      {currentTab === 'agents' && (
        <TableContainer component={Paper} className="fade-in" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Agent Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Active Tasks</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Approval Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.specialization}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{agent.activeComplaints}</TableCell>
                  <TableCell>
                    {agent.isApprovedAgent ? (
                      <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="Pending Verification" color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {agent.isApprovedAgent ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<BlockIcon />}
                        onClick={() => handleApproveAgent(agent.id, false)}
                      >
                        Revoke Approval
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApproveAgent(agent.id, true)}
                      >
                        Approve Agent
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 4. User Registry */}
      {currentTab === 'users' && (
        <TableContainer component={Paper} className="fade-in" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    <Chip label={u.role} color={u.role === 'ADMIN' ? 'secondary' : u.role === 'AGENT' ? 'info' : 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminDashboard;
