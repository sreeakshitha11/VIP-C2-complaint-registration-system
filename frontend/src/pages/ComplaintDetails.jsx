import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Rating,
  Avatar,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/Attachment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { toast } from 'react-toastify';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Status transition states
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Agent assignment states
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Feedback states
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Load complaint data
  const loadComplaint = async () => {
    try {
      const res = await axios.get(`/api/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
        setNewStatus(res.data.data.status);
      }
    } catch (err) {
      toast.error('Failed to load complaint details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const res = await axios.get(`/api/chat/${id}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
    }
  };

  // Load feedback details
  const loadFeedback = async () => {
    try {
      const res = await axios.get(`/api/feedback/${id}`);
      if (res.data.success) {
        setFeedbackDetails(res.data.data);
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      // It's normal to fail if no feedback was submitted yet
      setFeedbackSubmitted(false);
    }
  };

  // Load available agents (for Admin only)
  const loadAvailableAgents = async () => {
    if (user && user.role === 'ADMIN') {
      try {
        const res = await axios.get('/api/agents/available');
        if (res.data.success) {
          setAvailableAgents(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err.message);
      }
    }
  };

  useEffect(() => {
    loadComplaint();
    loadChatHistory();
    loadFeedback();
    loadAvailableAgents();
  }, [id, user]);

  // Handle Socket events
  useEffect(() => {
    if (socket && id) {
      // Join Room
      socket.emit('joinRoom', { complaintId: id });

      // Listen for message broadcasts
      socket.on('message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      if (socket) {
        socket.off('message');
      }
    };
  }, [socket, id]);

  // Scroll chat window to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socket) return;

    // Determine receiver ID
    let receiverId = null;
    if (user.role === 'USER') {
      receiverId = complaint?.assignedAgent?._id || null;
    } else if (user.role === 'AGENT') {
      receiverId = complaint?.userId?._id || null;
    }

    socket.emit('sendMessage', {
      complaintId: id,
      senderId: user.id,
      receiverId,
      message: typedMessage.trim(),
    });

    setTypedMessage('');
  };

  // Update Status handler
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    try {
      setStatusSubmitting(true);
      const res = await axios.put(`/api/complaints/${id}/status`, {
        status: newStatus,
        note: statusNote,
      });

      if (res.data.success) {
        toast.success('Complaint status updated!');
        setStatusNote('');
        loadComplaint();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Assign Agent handler
  const handleAssignAgent = async (e) => {
    e.preventDefault();
    if (!selectedAgent) {
      toast.warn('Please select an agent');
      return;
    }

    try {
      setAssignSubmitting(true);
      const res = await axios.put(`/api/complaints/${id}/assign`, {
        agentId: selectedAgent,
      });

      if (res.data.success) {
        toast.success('Agent assigned successfully!');
        loadComplaint();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign agent');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Submit Feedback handler
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      toast.warn('Please add a comment');
      return;
    }

    try {
      setFeedbackSubmitting(true);
      const res = await axios.post('/api/feedback', {
        complaintId: id,
        rating,
        comment: feedbackComment.trim(),
      });

      if (res.data.success) {
        toast.success('Thank you for your feedback!');
        setFeedbackDetails(res.data.data);
        setFeedbackSubmitted(true);
        loadComplaint();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Chip rendering helpers
  const getStatusChip = (statusVal) => {
    const configs = {
      PENDING: { label: 'Pending Approval', color: 'warning' },
      ASSIGNED: { label: 'Assigned', color: 'info' },
      IN_PROGRESS: { label: 'In Progress', color: 'secondary' },
      RESOLVED: { label: 'Resolved', color: 'success' },
      REJECTED: { label: 'Rejected', color: 'error' },
    };
    const conf = configs[statusVal] || { label: statusVal, color: 'default' };
    return <Chip label={conf.label} color={conf.color} sx={{ fontWeight: 'bold' }} />;
  };

  const getPriorityChip = (prioVal) => {
    const color = prioVal === 'HIGH' ? 'error' : prioVal === 'MEDIUM' ? 'warning' : 'success';
    return <Chip label={prioVal} color={color} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="fade-in" sx={{ py: 6 }}>
      {/* Header Back Link */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }} color="inherit">
        Back to Dashboard
      </Button>

      <Grid container spacing={4}>
        {/* Left Hand: Ticket Details and Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={2}>
              <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Outfit' }}>
                {complaint.title}
              </Typography>
              <Box display="flex" gap={1}>
                {getPriorityChip(complaint.priority)}
                {getStatusChip(complaint.status)}
              </Box>
            </Box>

            <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
              Category: <b>{complaint.category}</b> | Registered on:{' '}
              <b>{new Date(complaint.createdAt).toLocaleString()}</b>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }} color="text.secondary">
              {complaint.description}
            </Typography>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Attachments ({complaint.attachments.length})
                </Typography>
                <Grid container spacing={2} mt={1}>
                  {complaint.attachments.map((file, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        p={1.5}
                        borderRadius={1}
                        border="1px solid"
                        borderColor="divider"
                        component="a"
                        href={`/uploads/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <AttachmentIcon color="primary" />
                        <Typography variant="caption" noWrap sx={{ maxWidth: '80%', fontWeight: 'bold' }}>
                          {file.split('-').slice(1).join('-') || file}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {/* People Info Section */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Ticket Stakeholders
            </Typography>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Filed By:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {complaint.userId?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email: {complaint.userId?.email} | Tel: {complaint.userId?.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned Agent:
                </Typography>
                {complaint.assignedAgent ? (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      {complaint.assignedAgent?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email: {complaint.assignedAgent?.email} | Tel: {complaint.assignedAgent?.phone}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="error" fontWeight="bold">
                    Awaiting Agent Assignment
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Timeline Visual Progress Component */}
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Status Timeline Tracker
            </Typography>

            <List sx={{ position: 'relative', p: 0 }}>
              {complaint.timeline.map((step, idx) => (
                <ListItem
                  key={step._id}
                  alignItems="flex-start"
                  sx={{
                    p: 0,
                    pb: idx === complaint.timeline.length - 1 ? 0 : 4,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 20,
                      top: 10,
                      bottom: 0,
                      width: '2px',
                      bgcolor: idx === complaint.timeline.length - 1 ? 'transparent' : 'primary.main',
                      opacity: 0.3,
                      zIndex: 1,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      mr: 2,
                      zIndex: 2,
                      border: '4px solid',
                      borderColor: 'background.paper',
                    }}
                  >
                    {step.status === 'RESOLVED' ? (
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                    ) : step.status === 'PENDING' ? (
                      <HelpOutlineIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <InfoIcon sx={{ fontSize: 20 }} />
                    )}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {step.status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(step.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>
                          {step.note}
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight="bold">
                          Updated By: {step.updatedBy?.name} ({step.updatedBy?.role})
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* User Feedback Panel */}
          {complaint.status === 'RESOLVED' && user.role === 'USER' && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Customer Satisfaction Feedback
              </Typography>
              {feedbackSubmitted ? (
                <Box mt={2} p={2} bgcolor="action.hover" borderRadius={2} border="1px solid" borderColor="success.main">
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Rating value={feedbackDetails?.rating} readOnly />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {feedbackDetails?.rating} / 5 Stars
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    "{feedbackDetails?.comment}"
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.6 }}>
                    Submitted on: {new Date(feedbackDetails?.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleFeedbackSubmit} mt={2}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="subtitle2">Your Rating:</Typography>
                    <Rating value={rating} onChange={(_, val) => setRating(val)} size="large" />
                  </Box>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={3}
                    label="Share your review comment..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  <Button type="submit" variant="contained" color="success" disabled={feedbackSubmitting}>
                    {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* Show feedback to Agents / Admins if submitted */}
          {complaint.status === 'RESOLVED' && user.role !== 'USER' && feedbackSubmitted && feedbackDetails && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Client Review Feedback
              </Typography>
              <Box mt={2} p={2} bgcolor="action.hover" borderRadius={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating value={feedbackDetails.rating} readOnly />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {feedbackDetails.rating} / 5
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  "{feedbackDetails.comment}"
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Right Hand: Action controls and Socket Chat window */}
        <Grid item xs={12} md={5}>
          {/* Admin Assign Agent Console */}
          {user.role === 'ADMIN' && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Assign Support Agent
              </Typography>
              <Box component="form" onSubmit={handleAssignAgent} display="flex" gap={2} alignItems="center">
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select Agent"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <MenuItem value="">-- Select Agent --</MenuItem>
                  {availableAgents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.specialization}) - Active: {agent.activeComplaints}
                    </MenuItem>
                  ))}
                </TextField>
                <Button type="submit" variant="contained" disabled={assignSubmitting || availableAgents.length === 0} sx={{ whiteSpace: 'nowrap' }}>
                  {assignSubmitting ? 'Assigning...' : 'Assign'}
                </Button>
              </Box>
              {availableAgents.length === 0 && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  No approved agents are available.
                </Typography>
              )}
            </Paper>
          )}

          {/* Agent / Admin Status Transitions */}
          {(user.role === 'AGENT' || user.role === 'ADMIN') && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Processor Status Controls
              </Typography>
              <Box component="form" onSubmit={handleUpdateStatus}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Update Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="ASSIGNED">Assigned</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  label="Status Update Note..."
                  placeholder="e.g. Verified database error, fixing transaction logic"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" fullWidth disabled={statusSubmitting}>
                  {statusSubmitting ? 'Processing...' : 'Apply Status Update'}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Socket.IO Real-time Chat Portal */}
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', height: 480 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
              Support Chat Logs
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Room-based chat between User, assigned Agent, and Admins.
            </Typography>

            <Divider />

            {/* Message History Scroller */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, my: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {messages.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                  <HourglassEmptyIcon sx={{ fontSize: 30, mb: 1, opacity: 0.5 }} />
                  <Typography variant="caption">No chat logs recorded yet. Send a message to start.</Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId?._id === user.id || msg.senderId === user.id;
                  const senderRole = msg.senderId?.role || '';
                  return (
                    <Box key={msg._id} sx={{ alignSelf: isSelf ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <Box display="flex" flexDirection="column" alignItems={isSelf ? 'flex-end' : 'flex-start'}>
                        <Typography variant="caption" sx={{ fontSize: '10px', opacity: 0.6, mb: 0.2 }}>
                          {msg.senderId?.name} ({senderRole})
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: isSelf ? 'primary.main' : 'background.default',
                            color: isSelf ? '#fff' : 'text.primary',
                            p: 1.5,
                            borderRadius: isSelf ? '12px 12px 0 12px' : '12px 12px 12px 0',
                            border: isSelf ? 'none' : '1px solid',
                            borderColor: 'divider',
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography variant="body2">{msg.message}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '9px', opacity: 0.5, mt: 0.2 }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </Box>

            {/* Message Typing Form */}
            <Box component="form" onSubmit={handleSendMessage} display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <IconButton type="submit" color="primary" disabled={!typedMessage.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComplaintDetails;
