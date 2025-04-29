import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider, AuthCodeMSALBrowserAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { useEffect, useState } from 'react';
import { graphApiScopes } from '../authConfig'; // Import graph scopes

export const useApiClient = () => {
  const { instance, accounts } = useMsal();
  const [apiClient, setApiClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!instance || accounts.length === 0) {
      setApiClient(null);
      return;
    }

    // Ensure instance is of type PublicClientApplication if needed, though useMsal provides IPublicClientApplication
    const msalInstance = instance as PublicClientApplication;
    const account = accounts[0];

    const authProviderOptions: AuthCodeMSALBrowserAuthenticationProviderOptions = {
      account: account,
      scopes: graphApiScopes.scopes, // Use the specific graph scopes
      interactionType: InteractionType.Silent // Prefer silent
    };

    const provider = new AuthCodeMSALBrowserAuthenticationProvider(
      msalInstance, // Pass the MSAL instance
      authProviderOptions // Pass the options object
    );

    const client = Client.initWithMiddleware({
      authProvider: provider,
    });

    setApiClient(client);

  }, [instance, accounts]);

  // Optional: Function to acquire token explicitly if needed, handling interaction
  /*
  const acquireToken = async (scopes: string[]): Promise<AuthenticationResult | null> => {
    if (!instance || accounts.length === 0) return null;
    const account = accounts[0];
    const request = {
        scopes: scopes,
        account: account,
    };

    try {
        // Try silent acquisition first
        return await instance.acquireTokenSilent(request);
    } catch (error) {
        // Fallback to popup/redirect if silent fails
        if (error instanceof InteractionRequiredAuthError) {
            console.warn('Silent token acquisition failed, attempting interaction...');
            try {
                return await instance.acquireTokenPopup(request); // Or acquireTokenRedirect
            } catch (popupError) {
                console.error('Interactive token acquisition failed:', popupError);
                return null;
            }
        } else {
            console.error('Token acquisition error:', error);
            return null;
        }
    }
  };
  */

  return apiClient; // Return the client instance
}; 