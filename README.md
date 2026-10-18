# RideMitra

RideMitra is a Next.js application for finding and publishing shared journeys.

## Hosting configuration

The deployed web service needs these environment variables:

- `DATABASE_URL`: Render PostgreSQL **Internal Database URL**. Keep this value secret.
- `RESEND_API_KEY`: API key from Resend, used only by the server to send email verification codes.
- `EMAIL_FROM`: Sender address verified with Resend, for example `RideMitra <no-reply@your-verified-domain.example>`. Replace this example with your actual verified sender.

The application creates its PostgreSQL tables automatically on the first API request. The SQL migration used to document the schema is in `database/migrations/001_initial_postgres.sql`.

## Authentication

- Email and password accounts are stored in PostgreSQL.
- Passwords and email verification codes are hashed before storage.
- Email verification codes expire after 10 minutes and allow at most five attempts.
- Sessions use an HTTP-only cookie; session tokens are stored hashed in PostgreSQL.
- Email delivery requires a configured Resend API key and verified sender. The app does not expose verification codes in API responses.

## Local development

1. Install Node.js 22 or newer.
2. Install dependencies with `npm install`.
3. Set `DATABASE_URL`, `RESEND_API_KEY`, and `EMAIL_FROM` in your local environment.
4. Run `npm run dev`.

Never commit secrets or paste connection URLs and API keys into public issues or chat messages.

## Build

```bash
npm ci
npm run build
```
