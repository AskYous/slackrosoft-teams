import { AuthenticationResult, AuthError, InteractionStatus, InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { useMsal, useMsalAuthentication } from "@azure/msal-react";
import { Client } from "@microsoft/microsoft-graph-client";
import { ChatMessage } from "@microsoft/microsoft-graph-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../authConfig"; // Assuming authConfig is in src

export const useChatMessages = (chatId: string | null) => {
  const { instance, accounts, inProgress } = useMsal();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [loading, setLoading] = useState(false); // Start false until chatId is valid
  const [error, setError] = useState<Error | null>(null);

  const account = accounts[0];

  // Memoize messageRequest to stabilize its reference
  const messageRequest = useMemo(() => ({
    ...loginRequest,
    scopes: [...loginRequest.scopes, "Chat.ReadWrite"]
  }), []); // loginRequest should be static, so empty dependency array is okay

  const { result, error: msalError } = useMsalAuthentication(InteractionType.Silent, {
    scopes: messageRequest.scopes,
    account: account,
  });
  const accessTokenFromResult = result?.accessToken; // Extract token string

  // Helper function to get a valid access token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    // Use the extracted token string directly if available
    if (accessTokenFromResult) {
      return accessTokenFromResult;
    }

    if (inProgress !== InteractionStatus.None || !account) {
      console.log("MSAL progress:", inProgress, "Account:", !!account);
      return null; // Still authenticating or no account
    }

    // Fallback to silent/popup acquisition if token from result is not available
    try {
      const silentResult = await instance.acquireTokenSilent({
        scopes: messageRequest.scopes,
        account: account,
      });
      return silentResult.accessToken;
    } catch (silentError: unknown) { // Use unknown for broader initial catch
      console.error("Silent token acquisition failed:", silentError);
      // Type guard for AuthError
      if (silentError instanceof AuthError && (silentError.errorCode === "interaction_required" || silentError.errorCode === "consent_required" || silentError.errorCode.includes("user_login_error"))) {
        try {
          // Cast instance to PublicClientApplication for type safety if needed, or handle potential null
          const pca = instance as PublicClientApplication;
          const popupResult: AuthenticationResult = await pca.acquireTokenPopup({
            scopes: messageRequest.scopes,
          });
          return popupResult.accessToken;
        } catch (popupError: unknown) { // Use unknown
          console.error("Popup token acquisition failed:", popupError);
          setError(popupError instanceof Error ? popupError : new Error(String(popupError)));
          return null;
        }
      } else {
        // Handle other types of errors or re-throw if necessary
        setError(silentError instanceof Error ? silentError : new Error(String(silentError)));
        return null;
      }
    }
    // Depend on the extracted token string and other stable/primitive values
  }, [instance, account, inProgress, messageRequest.scopes, accessTokenFromResult]);


  // Helper function to fetch messages using Graph API
  const fetchGraphMessages = useCallback(async (accessToken: string, currentChatId: string) => {
    setLoading(true);
    setError(null);

    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    try {
      // Fetch latest messages, ordered newest first by API
      const response = await graphClient.api(`/me/chats/${currentChatId}/messages`)
        .top(50) // Fetch latest 50 messages, consider pagination for larger chats
        .orderby("createdDateTime DESC")
        .get();

      // Reverse the array to display oldest first (top to bottom)
      setMessages(response.value.reverse());
    } catch (err: unknown) { // Use unknown
      console.error("useChatMessages fetchGraphMessages: API Error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setMessages(null);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are stable or passed as arguments


  // Effect to fetch messages when chatId changes or auth state resolves
  useEffect(() => {
    if (!chatId) {
      setMessages(null); // Clear messages if no chat selected
      setLoading(false);
      setError(null); // Clear error when no chat is selected
      return; // Don't proceed if chatId is null
    }

    // Auth/MSAL checks
    if (inProgress !== InteractionStatus.None) {
      // Still authenticating, wait...
      setLoading(true); // Show loading while MSAL is busy
      return;
    }
    if (!account) {
      setLoading(false);
      setError(new Error("No user account found. Please sign in."));
      setMessages(null);
      return;
    }
    if (msalError) {
      console.error("useChatMessages Effect: MSAL Silent Auth Error:", msalError);
      // Don't necessarily block fetching if popup might resolve it,
      // but show error state initially. getAccessToken will handle interaction.
      setError(msalError);
      setMessages(null);
      setLoading(false); // Show error state
      // No return here, let getAccessToken attempt recovery
    }


    // Attempt to fetch
    setLoading(true); // Indicate loading before attempting to get token/fetch
    getAccessToken().then(accessToken => {
      if (accessToken && chatId) { // Ensure chatId is still valid after async operation
        fetchGraphMessages(accessToken, chatId);
      } else if (!accessToken) {
        // If getAccessToken failed and set an error, it's already handled.
        // If it returned null without an error (e.g., waiting for interaction),
        // we might still be in a loading state or need to show an appropriate message.
        console.log("useChatMessages Effect: Could not obtain access token.");
        if (!error) { // Only set loading false if no error was previously set
          setLoading(false);
          // Optionally set a generic error if no token and no specific MSAL error
          // setError(new Error("Failed to get authentication token. Interaction might be required."));
        }
      }
      // setLoading(false) is called within fetchGraphMessages or if accessToken is null and no error
    }).catch(err => {
      // Catch errors from getAccessToken promise itself, though it aims to handle internally
      console.error("useChatMessages Effect: Error during getAccessToken execution:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    });

    // Re-run when chatId, auth state, or callbacks change
  }, [chatId, instance, account, inProgress, getAccessToken, fetchGraphMessages]); // REMOVED result, msalError


  // Function to send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim()) {
      console.error("sendMessage: Chat ID is missing or message content is empty.");
      setError(new Error("Cannot send message: Invalid chat or empty message.")); // Provide feedback
      return;
    }

    // Show loading state while sending
    setLoading(true); // Or perhaps a different state like 'sending'
    setError(null); // Clear previous errors

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError(new Error("Cannot send message: Authentication token unavailable."));
      setLoading(false); // Reset loading state
      return;
    }

    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const chatMessage = {
      body: {
        content: content,
        contentType: "html", // Use "html" if input allows formatting, else "text"
      },
    };

    try {
      // Consider adding optimistic UI update here (add message locally first)

      const sentMessage = await graphClient.api(`/me/chats/${chatId}/messages`).post(chatMessage);

      // Option 1: Re-fetch all messages (simpler, ensures consistency)
      // await fetchGraphMessages(accessToken, chatId);

      // Option 2: Add the sent message directly to the state (more responsive)
      // Note: The sentMessage object from Graph might not have all details (like full 'from').
      // Refetching might still be better for consistency unless you handle the optimistic update carefully.
      setMessages(prevMessages => [...(prevMessages ?? []), sentMessage]);
      // scrollToBottom(); // Scroll after adding new message - handled in component

    } catch (err: unknown) { // Use unknown
      console.error("sendMessage: API Error:", err);
      setError(err instanceof Error ? err : new Error("Failed to send message: " + String(err)));
      // Optionally: Remove optimistic update if it failed
    } finally {
      setLoading(false); // Set loading false after send attempt completes
    }
  }, [chatId, getAccessToken, fetchGraphMessages]); // Dependencies

  return { messages, loading, error, sendMessage };
}; 