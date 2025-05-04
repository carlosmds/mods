const AWS = require('aws-sdk');

// Cache for SSM parameters
const parameterCache = new Map();

async function getParameter(ssmClient, name) {
  // Check cache first
  if (parameterCache.has(name)) {
    return parameterCache.get(name);
  }

  try {
    const response = await ssmClient.getParameter({
      Name: name,
      WithDecryption: true
    }).promise();

    const value = response.Parameter.Value;
    parameterCache.set(name, value);
    return value;
  } catch (error) {
    console.error(`Error fetching parameter ${name}:`, error);
    throw error;
  }
}

async function loadSecrets(ssmClient) {
  try {
    const [
      jwtSecret,
      mailjetApiKey,
      mailjetSecretKey,
      stripeSecretKey,
      stripeWebhookSecret,
      senderEmail,
      supportEmail
    ] = await Promise.all([
      getParameter(ssmClient, '/mods/api/JWT_SECRET'),
      getParameter(ssmClient, '/mods/api/MAILJET_API_KEY'),
      getParameter(ssmClient, '/mods/api/MAILJET_SECRET_KEY'),
      getParameter(ssmClient, '/mods/api/STRIPE_SECRET_KEY'),
      getParameter(ssmClient, '/mods/api/STRIPE_WEBHOOK_SECRET'),
      getParameter(ssmClient, '/mods/api/SENDER_EMAIL'),
      getParameter(ssmClient, '/mods/api/SUPPORT_EMAIL')
    ]);
    process.env.JWT_SECRET = jwtSecret;
    process.env.MAILJET_API_KEY = mailjetApiKey;
    process.env.MAILJET_SECRET_KEY = mailjetSecretKey;
    process.env.STRIPE_SECRET_KEY = stripeSecretKey;
    process.env.STRIPE_WEBHOOK_SECRET = stripeWebhookSecret;
    process.env.SENDER_EMAIL = senderEmail;
    process.env.SUPPORT_EMAIL = supportEmail;

    console.log('Successfully loaded all secrets from SSM Parameter Store');
  } catch (error) {
    console.error('Failed to load secrets from SSM Parameter Store:', error);
    throw error;
  }
}

module.exports = {
  getParameter,
  loadSecrets
}; 