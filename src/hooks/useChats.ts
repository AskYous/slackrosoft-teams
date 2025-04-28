import { InteractionStatus, InteractionType } from "@azure/msal-browser";
import { useMsal, useMsalAuthentication } from "@azure/msal-react";
import { Client } from "@microsoft/microsoft-graph-client";
import { Chat } from "@microsoft/microsoft-graph-types";
import { useEffect, useState } from "react";
import { loginRequest } from "../authConfig";

export const useChats = () => {
  const { instance, accounts, inProgress } = useMsal();
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const account = accounts[0];

  const { result, error: msalError } = useMsalAuthentication(InteractionType.Silent, {
    scopes: loginRequest.scopes,
    account: account,
  });

  // Helper function to fetch chats using Graph API
  const fetchGraphChats = async (accessToken: string) => {
    setLoading(true);
    setError(null); // Clear previous errors

    const graphClient = Client.init({
      authProvider: async (done) => {
        done(null, accessToken);
      },
    });

    try {
      const response = await graphClient.api("/me/chats")
        .select("id,topic,chatType,createdDateTime,lastUpdatedDateTime")
        .top(50) // Consider making top count configurable or dynamic if needed
        .get();
      setChats(response.value);
    } catch (err) {
      console.error("useChats fetchGraphChats: API Error:", err); // Keep specific error context
      setError(err instanceof Error ? err : new Error(String(err)));
      setChats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Waiting for MSAL
    if (inProgress !== InteractionStatus.None) {
      setLoading(true);
      return;
    }

    // 2. No account
    if (!account) {
      setLoading(false);
      setError(new Error("No user account found. Please sign in."));
      setChats(null);
      return;
    }

    // 3. MSAL Error from useMsalAuthentication
    if (msalError) {
      console.error("useChats Effect: MSAL Silent Auth Error encountered:", msalError);
      setChats(null);
      if (msalError.name === "InteractionRequiredAuthError" || msalError.name === "BrowserAuthError") {
        setLoading(true); // Keep loading during popup attempt
        instance.acquireTokenPopup({ ...loginRequest, account: account })
          .then((popupResponse) => {
            // Successfully acquired token via popup. Fetch chats.
            // The hook *might* re-run, but calling fetch directly ensures it happens.
            if (popupResponse?.accessToken) {
              fetchGraphChats(popupResponse.accessToken);
            } else {
              console.error("useChats Effect: Popup succeeded but no access token received.");
              setError(new Error("Popup completed but failed to retrieve token."));
              setLoading(false);
            }
          })
          .catch(err => {
            console.error("useChats Effect: Interactive token acquisition failed:", err);
            setError(err);
            setLoading(false);
          });
      } else {
        // Unrecoverable MSAL error
        setError(msalError);
        setLoading(false);
      }
      return;
    }

    // 4. Result exists from useMsalAuthentication (ideal case)
    if (result?.accessToken) {
      fetchGraphChats(result.accessToken);
    }
    // 5. MSAL ready, account exists, no error, but no result yet... Try manual silent acquisition
    else if (!result && !msalError) { // Added check !msalError for clarity
      setLoading(true); // Keep loading while attempting silent acquisition

      instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: account,
      }).then(tokenResponse => {
        // Successfully acquired token silently
        if (tokenResponse?.accessToken) {
          fetchGraphChats(tokenResponse.accessToken);
        } else {
          console.error("useChats Effect: Manual silent auth succeeded but no access token received.");
          setError(new Error("Silent auth completed but failed to retrieve token."));
          setLoading(false);
        }

      }).catch(error => {
        console.error("useChats Effect: Manual acquireTokenSilent failed:", error);
        // Handle potential interaction requirement from silent failure
        if (error.name === "InteractionRequiredAuthError" || error.name === "BrowserAuthError") {
          // setLoading(true); // Already loading
          instance.acquireTokenPopup({ ...loginRequest, account: account })
            .then((popupResponse) => {
              // Successfully acquired token via popup after silent failure
              if (popupResponse?.accessToken) {
                fetchGraphChats(popupResponse.accessToken);
              } else {
                console.error("useChats Effect: Popup (after silent fail) succeeded but no access token received.");
                setError(new Error("Popup completed but failed to retrieve token."));
                setLoading(false);
              }
            })
            .catch(err => {
              console.error("useChats Effect: Interactive token acquisition failed (after manual silent fail):", err);
              setError(err);
              setLoading(false);
            });
        } else {
          // Other silent error
          setError(error);
          setLoading(false);
        }
      });
    } else {
      // This case should ideally not be reached if the above logic is sound,
      // but keep loading true just in case. Could indicate an unexpected state.
      console.warn("useChats Effect: Reached unexpected state, keeping loading true.", { result, msalError, account, inProgress });
      setLoading(true);
    }

  }, [result, msalError, instance, account, inProgress]); // Keep dependencies exhaustive

  return { chats, loading, error };
}; 