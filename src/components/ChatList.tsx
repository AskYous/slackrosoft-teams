import { Chat } from "@microsoft/microsoft-graph-types";
import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
}

const ChatList = ({ onSelectChat }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { getGraphClient, isLoading, error } = useGraph();

  const fetchChats = useCallback(async () => {
    try {
      const graphClient = await getGraphClient();
      const chatList = await graphClient.getChats();
      setChats(chatList);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, [getGraphClient]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Helper function to get chat display name
  const getChatDisplayName = (chat: Chat): string => {
    if (chat.topic) {
      return chat.topic;
    }

    // For direct chats without a topic, try to get the other person's name
    if (chat.members && chat.members.length > 0) {
      const members = chat.members.filter(m => m.displayName);
      if (members.length > 0) {
        return members.map(m => m.displayName).join(", ");
      }
    }

    return "Unnamed chat";
  };

  if (isLoading) {
    return <div className="p-4">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="border-r border-gray-200 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold p-4 border-b">Your Chats</h2>
      <ul>
        {chats.length === 0 ? (
          <li className="p-4 text-gray-500">No chats found</li>
        ) : (
          chats.map((chat) => (
            <li key={chat.id} className="border-b last:border-0">
              <button
                onClick={() => onSelectChat(chat.id!)}
                className="w-full p-4 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">{getChatDisplayName(chat)}</div>
                <div className="text-sm text-gray-500">
                  {new Date(chat.lastUpdatedDateTime || "").toLocaleString()}
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ChatList; 