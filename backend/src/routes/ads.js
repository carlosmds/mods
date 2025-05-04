const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateAd } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { MAX_ACTIVE_ADS, DURATION_DAYS } = require('../constants');

module.exports = (dynamoDB) => {
  const router = express.Router();

  // Create a new ad
  router.post('/', authenticateToken, validateAd, async (req, res) => {
    try {
      const { vehicleType, message, duration } = req.body;
      const { email } = req.user;

      const now = Math.floor(Date.now() / 1000);

      const result = await dynamoDB.scan({
        TableName: 'Ads',
        FilterExpression: 'active = :active',
        ExpressionAttributeValues: {
          ':active': 1
        }
      }).promise();

      if (result.Count >= MAX_ACTIVE_ADS) {
        return res.status(400).json({ error: req.t('ads.max_limit') });
      }

      // Create ad
      const ad = {
        id: uuidv4(),
        userEmail: email,
        vehicleType,
        message,
        duration,
        active: 0,
        createdAt: now,
        expiresAt: now + (DURATION_DAYS[duration] * 24 * 60 * 60),
        locale: req.language || 'en'
      };

      await dynamoDB.put({
        TableName: 'Ads',
        Item: ad
      }).promise();

      res.status(201).json(ad);
    } catch (error) {
      console.error('Error creating ad:', error);
      res.status(500).json({ error: req.t('ads.create_error') });
    }
  });

  // Get all active ads
  router.get('/active', async (req, res) => {
    try {
      const result = await dynamoDB.scan({
        TableName: 'Ads',
        FilterExpression: 'active = :active',
        ExpressionAttributeValues: {
          ':active': 1
        }
      }).promise();

      res.json(result.Items);
    } catch (error) {
      console.error('Error fetching active ads:', error);
      res.status(500).json({ error: req.t('ads.fetch_error') });
    }
  });

  return router;
}; 