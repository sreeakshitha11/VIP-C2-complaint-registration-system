import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';

const CreateComplaint = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('LOW');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast.warn('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    
    // Append attachments
    files.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const res = await axios.post('/api/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success('Complaint registered successfully!');
        navigate('/user/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" className="fade-in" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
        color="inherit"
      >
        Back
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: 'Outfit' }}>
          File a Complaint
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Describe your issue in detail. You can upload up to 5 supporting documents or images.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            required
            label="Complaint Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            placeholder="e.g. Account balance discrepancy"
          />

          <Box display="flex" gap={2} mt={1}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              margin="normal"
            >
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Billing">Billing</MenuItem>
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="General">General</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              margin="normal"
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </TextField>
          </Box>

          <TextField
            fullWidth
            required
            multiline
            rows={5}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            placeholder="Please detail what went wrong, steps to reproduce, and desired resolution..."
          />

          {/* File Upload Selector */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              border: '2px dashed #475569',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
            component="label"
          >
            <input
              type="file"
              multiple
              hidden
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" fontWeight="bold">
              Click to select attachments
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Allowed: JPG, PNG, GIF, PDF, DOCX, TXT (Max size: 5MB per file)
            </Typography>
          </Box>

          {/* List Selected Files */}
          {files.length > 0 && (
            <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
              <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                Selected files ({files.length}):
              </Typography>
              {files.map((file, idx) => (
                <Typography key={idx} variant="caption" display="block" color="text.secondary">
                  • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Typography>
              ))}
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ mt: 4, py: 1.3 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateComplaint;
