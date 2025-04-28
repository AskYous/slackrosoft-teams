import { cn } from "@/lib/utils"; // Assuming shadcn/ui utility for conditional classes
import { Chat } from "@microsoft/microsoft-graph-types";
import { FC } from "react";

interface ChatListProps {
  chats: Chat[];
  title: string;
  onSelectChat: (chatId: string) => void; // Add handler prop
  selectedChatId: string | null;       // Add selected ID prop
}

export const ChatList: FC<ChatListProps> = ({ chats, title, onSelectChat, selectedChatId }) => {
  return (
    // Adjusted styling: fixed width, full height, bg, text colors
    <div className="w-80 h-screen overflow-y-scroll border-r bg-primary text-accent flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="text-xl font-bold">{title}</div>
      </div>

      {/* Scrollable Chat List */}
      <div className="p-2 flex flex-col gap-1">
        {chats.map(chat => (
          <div
            key={chat.id}
            // Added onClick handler
            onClick={() => chat.id && onSelectChat(chat.id)}
            // Added styling for hover, padding, and conditional selection highlight
            className={cn(
              "cursor-pointer p-2 rounded hover:bg-accent/10",
              selectedChatId === chat.id && "bg-accent/20 font-semibold" // Highlight if selected
            )}
          >
            {/* Consider adding more details or click handler later */}
            <div className="text-sm truncate">{chat.topic ?? `Chat with ${chat.chatType === 'oneOnOne' ? chat.members?.[0]?.displayName : 'Group'}`}</div>
            {/* You might want to add last message snippet or timestamp here */}
          </div>
        ))}
      </div>
    </div>
  );
}; 