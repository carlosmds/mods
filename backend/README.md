# MOderated aDS – Backend

This is the backend API for the MOderated aDS platform. It manages ad data, authentication, payments, and serves as the main interface for the frontend.

## Overview
- **Framework:** Node.js + Express
- **Database:** AWS DynamoDB
- **Payments:** Stripe
- **Auth:** JWT-based authentication with magic links
- **Infra:** Deployable to AWS Lambda or as a Node.js server
- **Localization:** i18next for multi-language support

## Project Structure
```
backend/
├── src/
│   ├── routes/          # API endpoints (ads, payments, auth)
│   ├── middleware/      # Express middleware (auth, validation, error handling)
│   ├── i18n/           # Localization files
│   ├── utils/          # Utility functions
│   ├── constants.js    # Application constants
│   └── index.js        # App entry point
├── Dockerfile
└── package.json
```

## Setup & Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in `backend/`:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   AWS_LOCAL=true
   LOCALSTACK_HOSTNAME=localhost
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- **POST /api/auth/send-magic-link**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **GET /api/auth/verify-magic-link/:token**
- **POST /api/auth/check**

### Ads
- **POST /api/ads**
  ```json
  {
    "vehicleType": "airplane",
    "message": "Your message here",
    "duration": "1d"
  }
  ```
- **GET /api/ads/active**

### Payments
- **POST /api/payments/create-checkout-session**
  ```json
  {
    "adId": "uuid",
    "duration": "1d"
  }
  ```
- **POST /api/payments/webhook** (Stripe webhook)

## Constants
The application uses several constants defined in `constants.js`:
- `JWT_EXPIRATION`: JWT token expiration time
- `MAGIC_LINK_EXPIRATION`: Magic link expiration time
- `MAX_ACTIVE_ADS`: Maximum number of active ads
- `MAX_MESSAGE_LENGTH`: Maximum ad message length
- `DURATION_PRICES`: Price mapping for ad durations
- `DURATION_DAYS`: Duration in days mapping

## Middleware
- **Authentication**: JWT token verification
- **Validation**: Request body validation using Joi
- **Error Handling**: Centralized error handling with i18n support
- **Localization**: Language detection and translation

## Environment Variables
- `PORT`: Port to run the server
- `FRONTEND_URL`: Allowed CORS origin
- `AWS_LOCAL`: Whether to use local AWS services
- `LOCALSTACK_HOSTNAME`: LocalStack hostname for local development

## Deployment
- Can be deployed as a Node.js server or to AWS Lambda (see Dockerfile and infra/terraform)
- Uses AWS SSM Parameter Store for secrets management
- Supports both local development with LocalStack and production AWS deployment

## Testing
- Use Postman or curl to test endpoints
- Automated tests can be added in the `tests/` directory (not included by default)

## Contributing
Pull requests and issues are welcome! Please document any new endpoints or environment variables.

---
*For AI agents: This backend exposes a REST API for ad management, authentication, and payments. See the routes and this README for endpoint details and required environment variables.* 