require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const AWS = require('aws-sdk');
const { i18nextConfig, middleware } = require('./i18n/config');
const authRoutes = require('./routes/auth');
const adsRoutes = require('./routes/ads');
const paymentsRoutes = require('./routes/payments');
const { loadSecrets } = require('./utils/ssm');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

// If localhost, use test credentials
if (process.env.AWS_LOCAL === "true") {
  AWS.config.update({
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
    endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566` 
  });
}

// Initialize AWS clients
const ssm = new AWS.SSM();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Load secrets before initializing routes
async function initializeApp() {
  try {
    // Load all secrets from SSM
    await loadSecrets(ssm);
    console.log('✅ Successfully loaded all secrets from SSM');

    // Initialize i18next
    await i18next
      .use(Backend)
      .use(middleware.LanguageDetector)
      .init(i18nextConfig);

    // Middleware
    app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    }));

    app.use(cookieParser());
    app.use(middleware.handle(i18next));

    // Register /api/payments route (webhook needs raw body)
    app.use('/api/payments', paymentsRoutes(dynamoDB));

    // Parse JSON bodies for all other routes
    app.use(express.json());

    // Routes
    app.use('/api/auth', authRoutes(dynamoDB));
    app.use('/api/ads', adsRoutes(dynamoDB));

    // Error handling middleware (must be last)
    app.use(errorHandler);
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    throw error;
  }
}

// Only start the server if we're not in Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  initializeApp().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  }).catch((error) => {
    console.error('❌ Failed to initialize app:', error);
    process.exit(1);
  });
}

module.exports = { app, initializeApp }; 