const AWS = require('aws-sdk');
const https = require('https');
const os = require('os');
const { sendEmail } = require('./utils/email');

// Initialize AWS config
AWS.config.update({
  region: process.env.AWS_REGION
});

// If localhost, use test credentials
if (process.env.AWS_LOCAL === "true") {
  console.log('🔧 Running in local mode with LocalStack');
  AWS.config.update({
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
    endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566` 
  });
}

// Initialize AWS clients
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

// Cache for parameters
let GEMINI_API_KEY = null;
let MAILJET_API_KEY = null;
let MAILJET_SECRET_KEY = null;
let SENDER_EMAIL = null;
let SUPPORT_EMAIL = null;

async function loadEmailAddresses() {
  if (SENDER_EMAIL && SUPPORT_EMAIL) {
    console.log('📧 Using cached email addresses');
    return { senderEmail: SENDER_EMAIL, supportEmail: SUPPORT_EMAIL };
  }

  console.log('📧 Fetching email addresses from SSM Parameter Store');
  try {
    const [senderEmailResponse, supportEmailResponse] = await Promise.all([
      ssm.getParameter({
        Name: process.env.SENDER_EMAIL_PARAMETER,
        WithDecryption: true
      }).promise(),
      ssm.getParameter({
        Name: process.env.SUPPORT_EMAIL_PARAMETER,
        WithDecryption: true
      }).promise()
    ]);

    SENDER_EMAIL = senderEmailResponse.Parameter.Value;
    SUPPORT_EMAIL = supportEmailResponse.Parameter.Value;

    console.log('✅ Successfully retrieved email addresses');
    return { senderEmail: SENDER_EMAIL, supportEmail: SUPPORT_EMAIL };
  } catch (error) {
    console.error('❌ Error fetching email addresses:', error);
    throw error;
  }
}

async function loadMailjetKeys() {
  if (MAILJET_API_KEY && MAILJET_SECRET_KEY) {
    console.log('🔑 Using cached Mailjet keys');
    return { apiKey: MAILJET_API_KEY, secretKey: MAILJET_SECRET_KEY };
  }

  console.log('🔑 Fetching Mailjet keys from SSM Parameter Store');
  try {
    const [apiKeyResponse, secretKeyResponse] = await Promise.all([
      ssm.getParameter({
        Name: process.env.MAILJET_API_KEY_PARAMETER,
        WithDecryption: true
      }).promise(),
      ssm.getParameter({
        Name: process.env.MAILJET_SECRET_KEY_PARAMETER,
        WithDecryption: true
      }).promise()
    ]);

    MAILJET_API_KEY = apiKeyResponse.Parameter.Value;
    MAILJET_SECRET_KEY = secretKeyResponse.Parameter.Value;

    console.log('✅ Successfully retrieved Mailjet keys');
    return { apiKey: MAILJET_API_KEY, secretKey: MAILJET_SECRET_KEY };
  } catch (error) {
    console.error('❌ Error fetching Mailjet keys:', error);
    throw error;
  }
}

async function getGeminiApiKey() {
  if (GEMINI_API_KEY) {
    console.log('🔑 Using cached Gemini API key');
    return GEMINI_API_KEY;
  }

  console.log('🔑 Fetching Gemini API key from SSM Parameter Store');
  const params = {
    Name: process.env.GEMINI_API_KEY_PARAMETER,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameter(params).promise();
    GEMINI_API_KEY = response.Parameter.Value;
    console.log('✅ Successfully retrieved Gemini API key');
    return GEMINI_API_KEY;
  } catch (error) {
    console.error('❌ Error fetching Gemini API key:', error);
    throw error;
  }
}

async function callGeminiAPI(text) {
  console.log('🤖 Calling Gemini API for content moderation');
  const apiKey = await getGeminiApiKey();
  const prompt = `You are a content moderation system. Analyze the following text for:
- Hate speech (e.g., slurs, dehumanizing language, incitement)
- Offensive content (e.g., strong profanity, graphic violence, derogatory remarks)
- Sexually suggestive or explicit content (including implicit innuendo or provocative descriptions)

Pay close attention to:
- Sexual references (explicit or implicit)
- Adult or suggestive phrases, metaphors, or slang — in any language
- Descriptions or remarks that imply sexual context, body parts, or intent

Return ONLY a JSON object with these exact fields, without any additional text, markdown formatting, or code blocks:
{
  "score": (number from 0 to 10, where 0 is completely safe and 10 is extremely offensive/inappropriate. Score 6 or higher for ANY sexually suggestive content),
  "reason": (brief explanation of the score)
}

Text to analyze: "${text}"`;

  const data = JSON.stringify({
    contents: [{
      parts: [{ text: prompt }]
    }]
  });

  console.log('📝 Sending request to Gemini API');
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('📥 Received response from Gemini API');
          console.log('📦 Raw response:', data);
          
          const response = JSON.parse(data);
          console.log('📦 Parsed response:', JSON.stringify(response, null, 2));

          if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
            throw new Error('Invalid response structure from Gemini API');
          }

          const content = response.candidates[0].content;
          console.log('📦 Content:', JSON.stringify(content, null, 2));

          if (!content.parts || !content.parts[0] || !content.parts[0].text) {
            throw new Error('Invalid content structure from Gemini API');
          }

          // Clean up any potential markdown or code block formatting
          const cleanText = content.parts[0].text.replace(/```json\n?|\n?```/g, '').trim();
          console.log('📦 Cleaned text:', cleanText);

          const result = JSON.parse(cleanText);
          console.log('📊 Content moderation result:', result);
          resolve(result);
        } catch (error) {
          console.error('❌ Error parsing Gemini response:', error);
          console.error('📦 Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error calling Gemini API:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function updateAdStatus(id, active) {
  console.log(`🔄 Updating ad ${id} status to ${active}`);
  const params = {
    TableName: 'Ads',
    Key: { id },
    UpdateExpression: 'SET active = :active',
    ExpressionAttributeValues: {
      ':active': active
    }
  };

  try {
    await dynamodb.update(params).promise();
    console.log(`✅ Successfully updated ad ${id} status to ${active}`);
  } catch (error) {
    console.error(`❌ Error updating ad ${id} status:`, error);
    throw error;
  }
}

async function sendRejectionEmail(ad, moderationResult, locale = 'en') {
  console.log('📧 Preparing to send rejection email');
  
  try {
    // Load Mailjet keys and email addresses
    const [{ apiKey, secretKey }, { senderEmail, supportEmail }] = await Promise.all([
      loadMailjetKeys(),
      loadEmailAddresses()
    ]);

    process.env.MAILJET_API_KEY = apiKey;
    process.env.MAILJET_SECRET_KEY = secretKey;
    process.env.SENDER_EMAIL = senderEmail;
    process.env.SUPPORT_EMAIL = supportEmail;

    // Initialize i18next
    const i18next = require('i18next');
    const Backend = require('i18next-fs-backend');
    const path = require('path');

    await i18next
      .use(Backend)
      .init({
        backend: {
          loadPath: path.join(__dirname, 'i18n/locales/{{lng}}.json')
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'pt-BR'],
        preload: ['en', 'pt-BR'],
        lng: locale
      });

    const emailContent = i18next.t('moderation.rejected_email', {
      adId: ad.id,
      score: moderationResult.score,
      reason: moderationResult.reason,
      email: supportEmail
    });

    await sendEmail({
      to: ad.userEmail,
      subject: i18next.t('moderation.rejected_subject'),
      text: emailContent.replace(/<[^>]*>/g, ''),
      html: emailContent
    });

    console.log('✅ Rejection email sent successfully');
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  console.log('🚀 Lambda function invoked');
  console.log('📦 Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    if (record.eventName === 'MODIFY') {
      console.log('📝 Processing MODIFY event');
      const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);

      console.log('📊 Old image:', JSON.stringify(oldImage, null, 2));
      console.log('📊 New image:', JSON.stringify(newImage, null, 2));

      // Only process if active status changed from 0 to 1
      if (oldImage.active === 0 && newImage.active === 1) {
        console.log(`🔍 Processing ad: ${newImage.id}`);
        
        try {
          const result = await callGeminiAPI(newImage.message);
          console.log('📊 Content moderation result:', result);

          if (result.score >= 6) {
            console.log(`❌ Ad ${newImage.id} failed content moderation. Score: ${result.score}`);
            await updateAdStatus(newImage.id, 0);
            
            // Send rejection email
            await sendRejectionEmail(oldImage, result, oldImage.locale || 'en');
          } else {
            console.log(`✅ Ad ${newImage.id} passed content moderation. Score: ${result.score}`);
          }
        } catch (error) {
          console.error('❌ Error in content moderation:', error);
          throw error;
        }
      } else {
        console.log('⏭️ Skipping event - not a status change from 0 to 1');
      }
    }
  }

  console.log('🏁 Lambda function completed');
}; 