// Authentication constants
const JWT_EXPIRATION = '7d';
const MAGIC_LINK_EXPIRATION = 900; // 15 minutes in seconds

// Ad-related constants
const MAX_ACTIVE_ADS = 6;
const MAX_MESSAGE_LENGTH = 240;

// Duration prices (in cents)
const DURATION_PRICES = {
  '1d': 499,  // R$ 4.99
  '1w': 1899, // R$ 18.99
  '1m': 2999  // R$ 29.99
};

// Duration in days
const DURATION_DAYS = {
  '1d': 1,
  '1w': 7,
  '1m': 30
};

module.exports = {
  JWT_EXPIRATION,
  MAGIC_LINK_EXPIRATION,
  MAX_ACTIVE_ADS,
  MAX_MESSAGE_LENGTH,
  DURATION_PRICES,
  DURATION_DAYS
}; 