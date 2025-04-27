import { Chat } from "@microsoft/microsoft-graph-types";
import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";

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

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.topic) {
      return chat.topic;
    }
    if (chat.members && chat.members.length > 0) {
      const members = chat.members.filter(m => m.displayName);
      if (members.length > 0) {
        return members.map(m => m.displayName).join(", ");
      }
    }
    return "Unnamed chat";
  };

  // Helper function to format date/time or return placeholder
  const formatLastUpdated = (dateTime: string | undefined | null): string => {
    if (!dateTime) return "";
    try {
      return new Date(dateTime).toLocaleString([], {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    // Match sidebar text color
    return <div className="p-4 text-gray-400">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <>
      {chats.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-400">No chats found</p>
      ) : (
        chats.map((chat) => {
          const isSelected = selectedChatId === chat.id;
          const displayName = getChatDisplayName(chat);
          const lastUpdated = formatLastUpdated(chat.lastUpdatedDateTime);

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id!)}
              className={`
                px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-100 ease-in-out 
                group flex justify-between items-center 
                ${isSelected
                  ? 'bg-blue-600 text-white' // Selected state: Slack-like blue background, white text
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100' // Default state: gray text, darker bg on hover
                }
              `}
              title={`${displayName}\nLast updated: ${lastUpdated}`} // Tooltip for full info
            >
              {/* Chat Title / Name */}
              <span className="text-sm font-medium truncate flex-1 mr-2">
                {displayName}
              </span>
              {/* Last Updated Time (optional, shown on hover/selected?) - Kept subtle for now */}
              <span className={`text-xs flex-shrink-0 ${isSelected ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {lastUpdated}
              </span>
            </div>
          );
        })
      )}
    </>
  );
};

export default ChatList; 