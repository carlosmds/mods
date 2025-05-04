const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email');
const { validateMagicLink } = require('../middleware/validation');
const { JWT_EXPIRATION, MAGIC_LINK_EXPIRATION } = require('../constants');

module.exports = (dynamoDB) => {
  const router = express.Router();

  // Send magic link
  router.post('/send-magic-link', validateMagicLink, async (req, res) => {
    try {
      const { email } = req.body;
      const token = uuidv4();
      
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + MAGIC_LINK_EXPIRATION;

      // Store token in DynamoDB with expiration
      await dynamoDB.put({
        TableName: 'MagicLinks',
        Item: {
          token,
          email,
          expiresAt,
          createdAt: now
        }
      }).promise();

      // Send magic link email
      const magicLink = `${process.env.FRONTEND_URL}/auth/verify/${token}`;
      await sendEmail({
        to: email,
        subject: req.t('auth.magic_link_subject'),
        text: req.t('auth.magic_link_text', { link: magicLink }),
        html: req.t('auth.magic_link_html', { link: magicLink })
      });

      res.json({ message: req.t('auth.magic_link_sent') });
    } catch (error) {
      console.error('Error sending magic link:', error);
      res.status(500).json({ error: req.t('auth.magic_link_error') });
    }
  });

  // Verify magic link
  router.get('/verify-magic-link/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const result = await dynamoDB.get({
        TableName: 'MagicLinks',
        Key: { token }
      }).promise();
      
      const now = Math.floor(Date.now() / 1000);
      
      if (!result.Item) {
        return res.status(400).json({ error: req.t('auth.invalid_token') });
      }
      
      if (result.Item.expiresAt < now) {
        return res.status(400).json({ error: req.t('auth.invalid_token') });
      }

      // Create JWT token
      const jwtToken = jwt.sign(
        { email: result.Item.email },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      // Delete used magic link
      await dynamoDB.delete({
        TableName: 'MagicLinks',
        Key: { token }
      }).promise();

      // Set JWT in HTTP-only cookie
      res.cookie('jwt', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error verifying magic link:', error);
      res.status(500).json({ error: req.t('auth.verify_error') });
    }
  });

  // Check authentication status
  router.post('/check', async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        isAuthenticated: true,
        email: decoded.email
      });
    } catch (error) {
      // If token verification fails, clear the invalid cookie
      res.clearCookie('jwt');
      res.json({ isAuthenticated: false });
    }
  });

  return router;
}; 