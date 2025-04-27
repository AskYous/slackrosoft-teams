import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useCallback, useState } from "react";
import { loginRequest } from "../config/authConfig";
import { GraphService } from "../services/graphService";

export const useGraph = () => {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getGraphClient = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token for Microsoft Graph API
      const account = accounts[0];

      if (!account) {
        throw new Error("No active account! Please sign in first.");
      }

      let authResult;

      try {
        // Try to silently acquire token
        authResult = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // If silent token acquisition fails, try interactive method
          authResult = await instance.acquireTokenPopup({
            ...loginRequest,
            account,
          });
        } else {
          throw error;
        }
      }

      // Create and return Graph client
      return new GraphService(authResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [instance, accounts]);

  return {
    getGraphClient,
    isLoading,
    error,
  };
}; 