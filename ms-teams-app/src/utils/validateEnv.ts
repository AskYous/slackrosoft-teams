/**
 * Validates required environment variables and logs warnings if any are missing
 */
const validateEnv = (): void => {
  const requiredVars = [
    'VITE_MSAL_CLIENT_ID',
    'VITE_MSAL_AUTHORITY',
    'VITE_MSAL_REDIRECT_URI',
    'VITE_GRAPH_ME_ENDPOINT',
    'VITE_GRAPH_CHATS_ENDPOINT',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName as keyof ImportMetaEnv]
  );

  if (missingVars.length > 0) {
    console.warn(
      '⚠️ Missing environment variables:',
      missingVars.join(', '),
      '\nApplication may not function correctly. Make sure to set these in your .env file.'
    );
  }
};

export default validateEnv; 