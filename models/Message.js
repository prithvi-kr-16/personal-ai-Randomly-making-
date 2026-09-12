const mongoose = require('mongoose');

// Har message (user ka ya AI ka) is schema ke format me DB me save hoga.
// 'role' batata hai ye kisne bola - "user" ya "assistant".
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
