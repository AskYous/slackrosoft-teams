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
        setLoading(true);
        instance.acquireTokenPopup({ ...loginRequest, account: account })
          .then(() => {
            // Success! Hook will re-run.
          })
          .catch(err => {
            console.error("useChats Effect: Interactive token acquisition failed:", err);
            setError(err);
            setLoading(false);
          });
      } else {
        setError(msalError);
        setLoading(false);
      }
      return;
    }

    // 4. Result exists from useMsalAuthentication (ideal case)
    if (result) {
      const graphClient = Client.init({
        authProvider: async (done) => {
          done(null, result.accessToken);
        },
      });

      const fetchChats = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await graphClient.api("/me/chats")
            .select("id,topic,chatType,createdDateTime,lastUpdatedDateTime")
            .top(50)
            .get();
          setChats(response.value);
        } catch (err) {
          console.error("useChats Effect: API Error during fetch:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setChats(null);
        } finally {
          setLoading(false);
        }
      };
      fetchChats();
    }
    // 5. MSAL ready, account exists, no error, but no result yet... Try manual silent acquisition
    else {
      setLoading(true);

      instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: account,
      }).then(tokenResponse => {
        const graphClient = Client.init({
          authProvider: async (done) => {
            done(null, tokenResponse.accessToken);
          },
        });
        const fetchChats = async () => {
          setError(null);
          try {
            const response = await graphClient.api("/me/chats")
              .select("id,topic,chatType,createdDateTime,lastUpdatedDateTime")
              .top(50)
              .get();
            setChats(response.value);
          } catch (err) {
            console.error("useChats Effect: API Error during fetch (manual):", err);
            setError(err instanceof Error ? err : new Error(String(err)));
            setChats(null);
          } finally {
            setLoading(false);
          }
        };
        fetchChats();

      }).catch(error => {
        console.error("useChats Effect: Manual acquireTokenSilent failed:", error);
        if (error.name === "InteractionRequiredAuthError" || error.name === "BrowserAuthError") {
          instance.acquireTokenPopup({ ...loginRequest, account: account })
            .then((popupResponse) => {
              const graphClient = Client.init({
                authProvider: async (done) => {
                  done(null, popupResponse.accessToken);
                },
              });
              const fetchChats = async () => {
                setLoading(true);
                setError(null);
                try {
                  const response = await graphClient.api("/me/chats")
                    .select("id,topic,chatType,createdDateTime,lastUpdatedDateTime")
                    .top(50)
                    .get();
                  setChats(response.value);
                } catch (err) {
                  console.error("useChats Effect: API Error during fetch (popup):", err);
                  setError(err instanceof Error ? err : new Error(String(err)));
                  setChats(null);
                } finally {
                  setLoading(false);
                }
              };
              fetchChats();
            })
            .catch(err => {
              console.error("useChats Effect: Interactive token acquisition failed (after manual silent fail):", err);
              setError(err);
              setLoading(false);
            });
        } else {
          setError(error);
          setLoading(false);
        }
      });
    }

  }, [result, msalError, instance, account, inProgress]);

  return { chats, loading, error };
}; 