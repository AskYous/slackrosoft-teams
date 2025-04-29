import { Configuration, LogLevel } from "@azure/msal-browser";

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: import.meta.env.VITE_MSAL_AUTHORITY,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: "/", // Redirect here after logout
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message); // Comment out or remove for less verbose logging
            return;
          case LogLevel.Verbose:
            // console.debug(message); // Comment out or remove for less verbose logging
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

// Scopes required for the application overall, including login
export const loginRequest = {
  scopes: [
    "openid", // Standard OpenID Connect scope
    "profile", // Standard OpenID Connect scope
    "User.Read", // Basic user profile
    "Chat.ReadWrite", // Read/write user's chats
    "ChatMessage.Send", // Send messages
    "User.ReadBasic.All", // Read basic profile of all users (needed for names/photos)
    "Presence.Read.All" // Read presence status of all users
  ]
};

// Scopes specifically needed for Microsoft Graph API calls by the client
// Often overlaps with loginRequest, but defined separately for clarity
export const graphApiScopes = {
  // Use the same scopes needed for your API calls
  // The AuthCodeMSALBrowserAuthenticationProvider will request these
  scopes: [
    "User.Read",
    "Chat.ReadWrite",
    "ChatMessage.Send",
    "User.ReadBasic.All",
    "Presence.Read.All"
  ]
};