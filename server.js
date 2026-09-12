require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./routes/chat');
const officeRoutes = require('./routes/office');
const researchRoutes = require('./routes/research');
const freelanceRoutes = require('./routes/freelance');
const dropshipRoutes = require('./routes/dropship');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serves the chat UI
app.use('/generated', express.static(path.join(__dirname, 'generated'))); // serves generated Office files for download

// Routes
app.use('/api', chatRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/freelance', freelanceRoutes);
app.use('/api/dropship', dropshipRoutes);

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Personal AI brain running on http://localhost:${PORT}`);
});
