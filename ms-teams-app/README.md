# MS Teams Chat Manager

A minimalistic single-page application that allows users to sign in with their Microsoft accounts and manage their Microsoft Teams chats using the Microsoft Graph API.

## Features

- Sign in with Microsoft account
- View list of MS Teams chats
- Read chat messages
- Send new messages
- View your profile information

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Microsoft 365 account with Teams access
- Azure AD app registration with appropriate permissions

## Setup

1. Clone the repository

   ```
   git clone <repository-url>
   cd ms-teams-app
   ```

2. Install dependencies

   ```
   npm install --legacy-peer-deps
   ```

3. Configure environment variables

   Copy the example environment file and update with your settings:

   ```
   cp .env.example .env
   ```

   Edit the `.env` file and update:

   ```
   VITE_MSAL_CLIENT_ID=your_azure_ad_client_id
   VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/common
   VITE_MSAL_REDIRECT_URI=http://localhost:5173
   ```

   > Note: Make sure your Azure AD app is registered with the following Microsoft Graph API permissions:
   > - User.Read
   > - Chat.ReadWrite
   > - ChatMessage.Read
   > - ChatMessage.Send
   > - TeamMember.Read.All

4. Start the development server

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Environment Configuration

The application supports different environment settings for development, test, and production:

- `.env`: Default environment variables (always loaded)
- `.env.local`: Local overrides (loaded for all environments except test)
- `.env.development`: Development-specific settings (used with `npm run dev`)
- `.env.test`: Test-specific settings (used with `npm run test`)
- `.env.production`: Production-specific settings (used with `npm run build`)

See the [Vite documentation](https://vitejs.dev/guide/env-and-mode.html) for more information on environment variable handling.

## Building for Production

To build the app for production, run:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

For production deployment, ensure you set the environment variables appropriately in your hosting environment.

## Technologies Used

- React
- TypeScript
- Microsoft Authentication Library (MSAL)
- Microsoft Graph API
- React Router
- Tailwind CSS
- Vite
