const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectMySQL, getIsUsingFallback } = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const interrogationRoutes = require('./routes/interrogationRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const contradictionRoutes = require('./routes/contradictionRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const accusationRoutes = require('./routes/accusationRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health & System Diagnostic Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Mystery Web - Digital Detective Investigation Engine',
    databaseMode: getIsUsingFallback() ? 'In-Memory Resilient Store' : 'MySQL Database',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/interrogate', interrogationRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/contradictions', contradictionRoutes);
app.use('/api/notebook', notebookRoutes);
app.use('/api/accuse', accusationRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start Server & Connect Database
async function startServer() {
  await connectMySQL();
  app.get("/", (req, res) => {
    res.json({
      message: "Mystery Web Backend is running successfully"
    });
  });

  app.listen(PORT, () => {
    console.log(`🕵️ [Mystery Web Backend] Server running at http://localhost:${PORT}`);
    console.log(`🔍 [Database Status] Mode: ${getIsUsingFallback() ? 'Resilient Store (MySQL Credentials Pending)' : 'Connected to MySQL'}`);
  });
}

startServer();
