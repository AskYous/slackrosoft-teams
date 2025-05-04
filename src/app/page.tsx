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

// Define a basic type for a chat item (adjust as needed based on Graph API response)
interface Chat {
  id: string;
  topic?: string;
  lastUpdatedDateTime: string;
  // Add other relevant fields
}

interface GraphChatResponse {
  value: Chat[];
  // Add other potential response fields like @odata.nextLink if handling pagination
}

const useChats = () => {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      // Ensure session and accessToken are available
      if (!session?.accessToken) {
        // If there's no session or token yet, don't attempt to fetch
        // Set loading to false if it wasn't the initial load,
        // or keep it true if we are waiting for session
        if (session !== undefined) {
          // Check if session has been checked (not just initial undefined)
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://graph.microsoft.com/v1.0/me/chats",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message ||
              `Error fetching chats: ${response.statusText}`,
          );
        }

        const data: GraphChatResponse = await response.json();
        setChats(data.value || []); // The chats are typically in the 'value' array
      } catch (err: unknown) {
        console.error("Failed to fetch chats from Microsoft Graph:", err);
        if (err instanceof Error) {
          setError(err);
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
    // Re-fetch when the access token changes
  }, [session?.accessToken, session]); // Added session itself to handle initial undefined state transition

  return { chats, loading, error };
};

const ChatWindow = () => {
  const chats = useChats();
  return <div>Chat Window ({chats.chats.length})</div>;
};
