import { Configuration, LogLevel } from "@azure/msal-browser";

// Azure AD app registration configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || "", // From environment variable
    authority: import.meta.env.VITE_MSAL_AUTHORITY || "https://login.microsoftonline.com/common",
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
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
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Add scope for Microsoft Graph API - only user-consentable permissions
export const loginRequest = {
  scopes: [
    "User.Read", // Basic profile - user consentable
    "Chat.Read", // Read chats - user consentable
    "People.Read", // Read users' relevant people lists - user consentable
    "Presence.Read", // Read user presence information - user consentable
    "User.ReadBasic.All", // Read all users' basic profiles - user consentable
  ],
};

// Microsoft Graph endpoint
export const graphConfig = {
  graphMeEndpoint: import.meta.env.VITE_GRAPH_ME_ENDPOINT || "https://graph.microsoft.com/v1.0/me",
  graphChatsEndpoint: import.meta.env.VITE_GRAPH_CHATS_ENDPOINT || "https://graph.microsoft.com/v1.0/me/chats",
}; 