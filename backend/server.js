require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const CUSTOMER_PORTAL_URL = process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3020';
const CSM_DASHBOARD_URL = process.env.CSM_DASHBOARD_URL || 'http://localhost:3030';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, CUSTOMER_PORTAL_URL, CSM_DASHBOARD_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Twilio Compliance Embeddable Demo API'
  });
});

// API Routes
const authRoutes = require('./routes/auth');
const portalRoutes = require('./routes/portal');
const dashboardRoutes = require('./routes/dashboard');
const complianceRoutes = require('./routes/compliance');

app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/compliance', complianceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database models (create tables if they don't exist)
    // Use force: false to prevent dropping existing tables
    // alter mode can cause issues with existing data
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized');

    // Seed test data if in development mode
    if (process.env.NODE_ENV === 'development') {
      const seed = require('./scripts/seed');
      await seed();
    }

    // Start server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 Twilio Compliance Embeddable Demo API');
      console.log('='.repeat(50));
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
      console.log(`👤 Customer Portal URL: ${CUSTOMER_PORTAL_URL}`);
      console.log(`📊 CSM Dashboard URL: ${CSM_DASHBOARD_URL}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  console.log('Database connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  await sequelize.close();
  console.log('Database connection closed');
  process.exit(0);
});
