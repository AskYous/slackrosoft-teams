"use client";
import { signIn, useSession } from "next-auth/react";

import { useEffect, useState } from "react";

export default function Home() {
  const { status } = useSession();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {status === "loading" && <div>Loading...</div>}
      {status === "unauthenticated" && (
        <a
          href={`/api/auth/signin`}
          onClick={(e) => {
            e.preventDefault();
            signIn();
          }}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
        >
          Sign in
        </a>
      )}
      {status === "authenticated" && <ChatWindow />}
    </div>
  );
}
import { Client } from "@microsoft/microsoft-graph-client";
import { Chat } from "@microsoft/microsoft-graph-types"; // Import Chat type from the types package

// Keep the existing interface definitions for now, or adjust if needed
// interface Chat { ... } // We can potentially remove this if the imported Chat type suffices
// interface GraphChatResponse { ... } // This will likely become obsolete

const useChats = () => {
  const { data: session } = useSession();
  // Use the imported Chat type or keep your custom one if preferred
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!session?.accessToken) {
        if (session !== undefined) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Initialize the Microsoft Graph client
        const client = Client.init({
          authProvider: (done) => {
            done(null, session.accessToken); // Pass the access token
          },
        });

        // Make the API call using the client
        const response = await client.api("/me/chats").get();

        // The response structure from the client might be different
        // Usually, the list of items is directly in response.value
        setChats(response.value || []);

      } catch (err: unknown) {
        console.error("Failed to fetch chats from Microsoft Graph:", err);
        // Error handling can be refined based on graph client error structure
        if (err instanceof Error) {
           // Check for specific Graph client error types if needed
          setError(new Error(err.message || "Failed to fetch chats using Graph client."));
        } else {
          setError(
            new Error("An unknown error occurred while fetching chats."),
          );
        }
        setChats([]); // Clear chats on error
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [session?.accessToken, session]);

  return { chats, loading, error };
};

const ChatWindow = () => {
  const chats = useChats();
  return <div>Chat Window ({chats.chats.length})</div>;
};
