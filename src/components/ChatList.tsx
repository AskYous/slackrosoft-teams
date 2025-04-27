import { Chat } from "@microsoft/microsoft-graph-types";
import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const ChatList = ({ onSelectChat, selectedChatId }: ChatListProps) => {
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
    <div className="h-full">
      {chats.length === 0 ? (
        <p className="p-4 text-gray-500">No chats found</p>
      ) : (
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              onClick={() => onSelectChat(chat.id!)}
              className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-800'
                }`}
            >
              <CardHeader className="p-3">
                <CardTitle className={`text-sm font-medium ${selectedChatId === chat.id ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'}`}>
                  {getChatDisplayName(chat)}
                </CardTitle>
                <CardDescription className={`text-xs ${selectedChatId === chat.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {new Date(chat.lastUpdatedDateTime || "").toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList; 