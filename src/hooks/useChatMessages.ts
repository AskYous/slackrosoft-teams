import { AuthenticationResult, AuthError, InteractionStatus, InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { useMsal, useMsalAuthentication } from "@azure/msal-react";
// Remove Client import if no longer needed directly
// import { Client } from "@microsoft/microsoft-graph-client";
import { ChatMessage } from "@microsoft/microsoft-graph-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../authConfig"; // Assuming authConfig is in src
import { fetchMessages as fetchGraphMessagesService, sendMessage as sendGraphMessageService } from "../services/graphService"; // Corrected relative path

export const useChatMessages = (chatId: string | null) => {
  const { instance, accounts, inProgress } = useMsal();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [loading, setLoading] = useState(false); // Start false until chatId is valid
  const [sending, setSending] = useState(false); // Add separate state for sending
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


  // Helper function to fetch messages using Graph API Service
  const fetchGraphMessages = useCallback(async (accessToken: string, currentChatId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Call the service function to fetch messages
      const messagesResult = await fetchGraphMessagesService(accessToken, currentChatId);
      setMessages(messagesResult);
    } catch (err: unknown) { // Catch errors from the service
      console.error("useChatMessages fetchGraphMessages: API Service Error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setMessages(null);
    } finally {
      setLoading(false);
    }
    // Pass the service function as a dependency if its reference might change,
    // but since it's imported, it should be stable.
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

    // Setup event listener for message updates
    // In a real implementation, this would be handled by a Microsoft Graph subscription webhook
    // Here we're just implementing a client-side solution that doesn't require a webhook backend
    window.addEventListener('message', handleMessageEvent);

    return () => {
      window.removeEventListener('message', handleMessageEvent);
    };

    // Re-run when chatId, auth state, or callbacks change
  }, [chatId, instance, account, inProgress, getAccessToken, fetchGraphMessages]); // Dependency remains the same as fetchGraphMessages callback is stable

  // Handle incoming message events (simulating notification webhook)
  const handleMessageEvent = useCallback((event: MessageEvent) => {
    // In a real implementation, this would process webhooks from Microsoft Graph
    // Instead, we're going to let our message sending function trigger this
    if (event.data && event.data.type === 'CHAT_MESSAGE_RECEIVED' &&
      event.data.chatId === chatId) {
      // Add the new message to our state
      if (event.data.message) {
        setMessages(prevMessages =>
          [...(prevMessages ?? []), event.data.message]
        );
      } else if (event.data.refresh && chatId) {
        // Refresh messages if requested
        getAccessToken().then(accessToken => {
          if (accessToken) {
            // Use the internal fetchGraphMessages which now uses the service
            fetchGraphMessages(accessToken, chatId);
          }
        });
      }
    }
    // Pass fetchGraphMessages as dependency as it now wraps the service call
  }, [chatId, getAccessToken, fetchGraphMessages]);


  // Function to send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim()) {
      console.error("sendMessage: Chat ID is missing or message content is empty.");
      setError(new Error("Cannot send message: Invalid chat or empty message.")); // Provide feedback
      return;
    }

    // Show sending state instead of loading
    setSending(true); // Use sending state instead of loading
    setError(null); // Clear previous errors

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError(new Error("Cannot send message: Authentication token unavailable."));
      setSending(false); // Reset sending state
      return;
    }

    // Removed GraphClient initialization here

    try {
      // Call the service function to send the message
      const sentMessage = await sendGraphMessageService(accessToken, chatId, content);

      // Optimistically add the message to the UI
      setMessages(prevMessages => [...(prevMessages ?? []), sentMessage]);

      // Dispatch a client-side event to simulate a webhook notification
      // In a real implementation, this would be handled by Microsoft Graph subscriptions
      window.postMessage({
        type: 'CHAT_MESSAGE_RECEIVED',
        chatId: chatId,
        message: sentMessage
      }, '*');

    } catch (err: unknown) { // Catch errors from the service
      console.error("sendMessage: API Service Error:", err);
      setError(err instanceof Error ? err : new Error("Failed to send message: " + String(err)));
      // Optionally: Remove optimistic update if it failed
    } finally {
      setSending(false); // Set sending false after send attempt completes
    }
    // Pass getAccessToken as dependency as it's used directly
  }, [chatId, getAccessToken]); // Dependencies

  return { messages, loading, sending, error, sendMessage };
}; 