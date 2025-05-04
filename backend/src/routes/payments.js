const express = require('express');
const Stripe = require('stripe');
const { sendEmail } = require('../utils/email');
const { authenticateToken } = require('../middleware/auth');
const { DURATION_PRICES } = require('../constants');

// Initialize Stripe after parameters are loaded
let stripe;

module.exports = (dynamoDB) => {
  const router = express.Router();

  // Initialize Stripe with the secret key
  router.use((req, res, next) => {
    if (!stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error('Stripe secret key not found in environment variables');
        return res.status(500).json({ error: req.t('payment.checkout_error') });
      }
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    next();
  });

  // Parse JSON for all routes except /webhook
  router.use((req, res, next) => {
    if (req.originalUrl.endsWith('/webhook')) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // Create Stripe Checkout session
  router.post('/create-checkout-session', authenticateToken, async (req, res) => {
    try {
      const { adId, duration } = req.body;
      const { email } = req.user;

      // Get ad details
      const ad = await dynamoDB.get({
        TableName: 'Ads',
        Key: { id: adId }
      }).promise();

      if (!ad.Item || ad.Item.userEmail !== email) {
        return res.status(404).json({ error: req.t('payment.ad_not_found') });
      }

      const amount = DURATION_PRICES[duration];

      // Get user's preferred language from Accept-Language header
      const userLocale = req.language || 'en';
      const stripeLocale = userLocale === 'pt-BR' ? 'pt-BR' : 'en';

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: req.t('payment.product_name', { duration: req.t(`ads.durations.${duration}`) }),
              description: ad.Item.message
            },
            unit_amount: amount
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        metadata: {
          adId,
          email
        },
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic'
          }
        },
        locale: stripeLocale
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: req.t('payment.checkout_error') });
    }
  });

  // Stripe webhook handler
  router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(req.t('payment.webhook_error', { message: err.message }));
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { adId, email } = session.metadata;
      const locale = session.locale || 'en';

      try {
        // Update ad status to active
        await dynamoDB.update({
          TableName: 'Ads',
          Key: {
            id: adId
          },
          UpdateExpression: 'SET active = :active',
          ExpressionAttributeValues: {
            ':active': 1
          },
          ReturnValues: 'NONE'
        }).promise();

        // Initialize i18next with the session locale
        const i18next = require('i18next');
        const { i18nextConfig } = require('../i18n/config');
        await i18next.init(i18nextConfig);
        i18next.changeLanguage(locale);

        // Send confirmation email using the correct locale
        const emailContent = i18next.t('payment.confirmation_email', {
          adId,
          email: process.env.SUPPORT_EMAIL
        });

        await sendEmail({
          to: email,
          subject: i18next.t('payment.success'),
          text: emailContent.replace(/<[^>]*>/g, ''), // Remove HTML tags for text version
          html: emailContent
        });

      } catch (error) {
        console.error('Error updating ad status or sending email:', error);
        return res.status(500).send(req.t('payment.update_error'));
      }
    }

    res.json({ received: true });
  });

  return router;
}; 