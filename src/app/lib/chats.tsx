import { Client } from "@microsoft/microsoft-graph-client";
import { Chat } from "@microsoft/microsoft-graph-types";
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

const getClient = (accessToken: string) => Client.init({
  authProvider: (done) => {
    done(null, accessToken);
  },
});

export const getChats = async (): Promise<Chat[]> => {
  const session: Session | null = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken)
    throw new Error("Cannot fetch chats while user is not authenticated.");

  // Initialize the Microsoft Graph client
  const client = getClient(accessToken);

  // Make the API call using the client
  const response = await client.api("/me/chats").get();

  // The response structure from the client might be different
  // Usually, the list of items is directly in response.value
  return response.value ?? [];
};

export const getChat = async (chatId: string): Promise<Chat> => {
  const session: Session | null = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken)
    throw new Error("Cannot fetch chats while user is not authenticated.");

  const client = getClient(accessToken);

  const response = await client.api(`/me/chats/${chatId}`).get();
  return response.value as Chat;
};