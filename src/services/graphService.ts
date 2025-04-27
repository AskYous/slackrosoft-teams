import { AuthenticationResult } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { Chat, ChatMessage, Presence, User } from "@microsoft/microsoft-graph-types";

/**
 * Graph API Service for user profile and basic chat information
 * Only using permissions that don't require admin consent
 */
export class GraphService {
  private client: Client;

  constructor(authResult: AuthenticationResult) {
    // Initialize the Graph client with authentication
    this.client = Client.init({
      authProvider: (done) => {
        done(null, authResult.accessToken);
      },
    });
  }

  /**
   * Get current user information
   */
  public getUserInfo = async (): Promise<User> => {
    try {
      return await this.client.api("/me").get();
    } catch (error) {
      console.error("Error getting user info:", error);
      throw error;
    }
  };

  /**
   * Get list of chats (read-only with Chat.Read permission)
   * Expands members to get participant display names.
   */
  public getChats = async (): Promise<Chat[]> => {
    try {
      const response = await this.client
        .api("/me/chats")
        .expand("members")
        .select("id,topic,lastUpdatedDateTime,chatType,members")
        .top(50)
        .get();

      console.log("Fetched chats with expanded members:", JSON.stringify(response.value, null, 2));

      return response.value || [];
    } catch (error) {
      console.error("Error getting chats:", error);
      throw error;
    }
  };

  /**
   * Get messages from a specific chat (read-only with Chat.Read permission)
   */
  public getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
    try {
      const response = await this.client
        .api(`/me/chats/${chatId}/messages`)
        .top(50)
        .get();

      console.log(`Fetched messages for chat ${chatId}:`, JSON.stringify(response.value, null, 2));

      return response.value || [];
    } catch (error) {
      console.error(`Error getting messages for chat ${chatId}:`, error);
      throw error;
    }
  };

  /**
   * Get presence information for a user
   */
  public getUserPresence = async (): Promise<Presence> => {
    try {
      return await this.client.api("/me/presence").get();
    } catch (error) {
      console.error("Error getting user presence:", error);
      throw error;
    }
  };

  /**
   * Get people relevant to the current user
   */
  public getPeople = async () => {
    try {
      const response = await this.client
        .api("/me/people")
        .top(20)
        .get();

      return response.value;
    } catch (error) {
      console.error("Error getting people:", error);
      throw error;
    }
  };
} 