const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization'],
    trim: true,
  },
  activeComplaints: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Agent', AgentSchema);
