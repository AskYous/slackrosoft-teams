import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

let msalInstance: PublicClientApplication | null = null;

try {
  console.log('Initializing MSAL with config:', JSON.stringify({
    clientId: msalConfig.auth.clientId,
    authority: msalConfig.auth.authority,
    redirectUri: msalConfig.auth.redirectUri
  }));

  msalInstance = new PublicClientApplication(msalConfig);
  console.log('MSAL instance created successfully');
} catch (error) {
  console.error('Failed to initialize MSAL:', error);
  // Keep msalInstance as null if initialization fails
}

export { msalInstance };
