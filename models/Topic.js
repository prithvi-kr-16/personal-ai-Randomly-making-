const mongoose = require('mongoose');

// Jab bhi "is topic ko seekh lo" bola jayega, uska summary yahan save hoga.
// Isse AI ko future me wahi topic dobara pucho to purana research yaad rahega.
const topicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topic', topicSchema);
