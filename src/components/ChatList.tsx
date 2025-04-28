import { cn } from "@/lib/utils"; // Assuming shadcn/ui utility for conditional classes
import { useMsal } from "@azure/msal-react";
import { Chat, ConversationMember } from "@microsoft/microsoft-graph-types";
import { FC } from "react";

interface ChatListProps {
  chats: Chat[];
  title: string;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const getChatDisplayName = (chat: Chat, currentUserId: string) => {
  if (chat.topic) return chat.topic;
  if (chat.chatType === "oneOnOne" && Array.isArray(chat.members)) {
    // Exclude current user from display
    const otherMember = (chat.members as ConversationMember[]).find(m => m.id !== currentUserId);
    return otherMember ? otherMember.displayName : "Chat";
  }
  if (chat.chatType === "group" && Array.isArray(chat.members)) {
    // Show up to 3 names, excluding current user
    const names = (chat.members as ConversationMember[])
      .filter(m => m.id !== currentUserId)
      .map(m => m.displayName)
      .filter(Boolean);
    return names.length ? `${names.slice(0, 3).join(", ")}${names.length > 3 ? ", ..." : ""}` : "Group Chat";
  }
  return "Chat";
};

export const ChatList: FC<ChatListProps> = ({ chats, title, onSelectChat, selectedChatId }) => {
  const { accounts } = useMsal();
  const currentUserId = accounts[0]?.localAccountId || accounts[0]?.homeAccountId || "";

  return (
    // Adjusted styling: fixed width, full height, bg, text colors
    <div className="w-80 h-screen overflow-y-scroll border-r bg-[#4A154B] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
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
              "cursor-pointer p-2 rounded hover:bg-white/10",
              selectedChatId === chat.id && "bg-white/20 font-semibold"
            )}
          >
            <div className="text-sm truncate">{getChatDisplayName(chat, currentUserId)}</div>
            {/* You might want to add last message snippet or timestamp here */}
          </div>
        ))}
      </div>
    </div>
  );
}; 