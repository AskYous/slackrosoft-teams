import { Client } from "@microsoft/microsoft-graph-client";
import { ChatMessage } from "@microsoft/microsoft-graph-types";

/**
 * Initializes the Microsoft Graph client with the provided access token.
 */
const initializeGraphClient = (accessToken: string): Client => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
};

/**
 * Fetches the latest chat messages for a given chat ID.
 * @param accessToken - MSAL access token.
 * @param chatId - The ID of the chat to fetch messages from.
 * @returns A promise that resolves to an array of ChatMessage objects, ordered oldest to newest.
 */
export const fetchMessages = async (accessToken: string, chatId: string): Promise<ChatMessage[]> => {
  if (!accessToken || !chatId) {
    console.error("fetchMessages: Access token or chat ID is missing.");
    throw new Error("Access token or chat ID is missing.");
  }

  const graphClient = initializeGraphClient(accessToken);

  try {
    const response = await graphClient.api(`/me/chats/${chatId}/messages`)
      .top(50) // Fetch latest 50 messages
      .orderby("createdDateTime DESC")
      .get();

    // Reverse the array to display oldest first (top to bottom)
    return response.value.reverse() as ChatMessage[];
  } catch (error) {
    console.error("Graph Service fetchMessages Error:", error);
    // Re-throw the error to be handled by the calling hook
    throw error;
  }
};

/**
 * Sends a chat message to a given chat ID.
 * @param accessToken - MSAL access token.
 * @param chatId - The ID of the chat to send the message to.
 * @param content - The message content (HTML or text).
 * @returns A promise that resolves to the sent ChatMessage object.
 */
export const sendMessage = async (accessToken: string, chatId: string, content: string): Promise<ChatMessage> => {
  if (!accessToken || !chatId || !content.trim()) {
    console.error("sendMessage: Access token, chat ID, or content is missing/empty.");
    throw new Error("Access token, chat ID, or content is missing/empty.");
  }

  const graphClient = initializeGraphClient(accessToken);

  const chatMessage = {
    body: {
      content: content,
      contentType: "html", // Assuming HTML content for now
    },
  };

  try {
    const sentMessage = await graphClient.api(`/me/chats/${chatId}/messages`).post(chatMessage);
    return sentMessage as ChatMessage;
  } catch (error) {
    console.error("Graph Service sendMessage Error:", error);
    // Re-throw the error to be handled by the calling hook
    throw error;
  }
}; 