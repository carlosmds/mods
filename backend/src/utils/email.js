const axios = require('axios');

const sendEmail = async ({ to, subject, text, html }) => {
  // Validate required environment variables
  if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
    console.error('Missing Mailjet credentials:', {
      hasApiKey: !!process.env.MAILJET_API_KEY,
      hasSecretKey: !!process.env.MAILJET_SECRET_KEY
    });
    throw new Error('Mailjet credentials not configured');
  }

  if (!process.env.SENDER_EMAIL) {
    console.error('Missing sender email configuration');
    throw new Error('Sender email not configured');
  }

  const data = {
    Messages: [
      {
        From: {
          Email: process.env.SENDER_EMAIL,
          Name: "MOderated aDS"
        },
        To: [
          {
            Email: to,
            Name: to
          }
        ],
        Subject: subject,
        TextPart: text,
        HTMLPart: html
      }
    ]
  };

  try {
    console.log('Sending email with configuration:', {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      hasText: !!text,
      hasHtml: !!html
    });

    const response = await axios.post('https://api.mailjet.com/v3.1/send', data, {
      auth: {
        username: process.env.MAILJET_API_KEY,
        password: process.env.MAILJET_SECRET_KEY
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail }; 