import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { Client } from "@microsoft/microsoft-graph-client";
import { useEffect, useState } from "react";
import { loginRequest } from "../authConfig"; // Assuming authConfig is in src

export const useProfilePhoto = (userId: string | undefined | null) => {
  const { instance, accounts, inProgress } = useMsal();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const account = accounts[0];

  useEffect(() => {
    if (!userId || inProgress !== InteractionStatus.None || !account) {
      setPhotoUrl(null); // Reset if userId is missing or auth not ready
      setLoading(false);
      setError(null);
      return;
    }

    const getAccessToken = async (): Promise<string | null> => {
      try {
        const silentResult = await instance.acquireTokenSilent({
          scopes: loginRequest.scopes, // Assuming User.Read is sufficient or included
          account: account,
        });
        return silentResult.accessToken;
      } catch (silentError) {
        console.error("useProfilePhoto: Silent token acquisition failed:", silentError);
        // Simplified error handling for this hook, focusing on photo fetch
        // More robust handling (like popup) might be needed in a real app
        setError(new Error("Authentication failed"));
        return null;
      }
    };

    const fetchPhoto = async (accessToken: string) => {
      setLoading(true);
      setError(null);
      setPhotoUrl(null); // Reset previous photo

      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });

      try {
        // Getting /photo/$value should return a blob directly
        const response = await graphClient
          .api(`/users/${userId}/photo/$value`)
          // .responseType('blob') // Removed this line
          .get();

        // Check if response is a Blob before creating URL
        if (response instanceof Blob && response.size > 0) {
          const url = URL.createObjectURL(response);
          setPhotoUrl(url);
          // Clean up the object URL when the component unmounts or userId changes
          return () => URL.revokeObjectURL(url);
        } else {
          // Handle cases where the photo might not exist or response is unexpected
          console.warn(`No profile photo blob received for user ${userId}`);
          setPhotoUrl(null); // Explicitly set to null if no valid blob
        }

      } catch (err: unknown) { // Use unknown instead of any
        // Check if the error is a known Graph error structure or generic error
        let statusCode = 0;
        let message = '';

        // Safely check for properties on the error object
        if (typeof err === 'object' && err !== null) {
          if ('statusCode' in err && typeof err.statusCode === 'number') {
            statusCode = err.statusCode;
          }
          if ('message' in err && typeof err.message === 'string') {
            message = err.message;
          }
        }

        // Check if the error is a 404 Not Found, which is expected if no photo exists
        if (statusCode === 404 || message.includes('ErrorItemNotFound') || message.includes('ImageNotFound')) {
          console.log(`No profile photo found for user ${userId}.`);
          setPhotoUrl(null); // No photo available is not necessarily an "error" state
        } else {
          console.error(`useProfilePhoto fetchPhoto: API Error for user ${userId}:`, err);
          setError(err instanceof Error ? err : new Error(String(err ?? 'Unknown error'))); // Provide fallback for String()
          setPhotoUrl(null);
        }
      } finally {
        setLoading(false);
      }
    };

    let cleanupUrl: (() => void) | undefined;

    getAccessToken().then(token => {
      if (token && userId) {
        fetchPhoto(token).then(cleanup => {
          cleanupUrl = cleanup; // Store the cleanup function
        });
      } else {
        // If no token, loading stops, potentially an error is set
        setLoading(false);
      }
    });

    // Cleanup function for useEffect
    return () => {
      if (cleanupUrl) {
        cleanupUrl(); // Revoke the object URL
      }
    };

  }, [userId, instance, account, inProgress]); // Use specific account object

  return { photoUrl, loading, error };
}; 