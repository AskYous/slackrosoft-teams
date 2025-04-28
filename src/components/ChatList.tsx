import { cn } from "@/lib/utils"; // Assuming shadcn/ui utility for conditional classes
import { useMsal } from "@azure/msal-react";
import { Chat, ConversationMember } from "@microsoft/microsoft-graph-types";
import { FC } from "react";
import { useProfilePhoto } from "../hooks/useProfilePhoto";

interface ChatListProps {
  chats: Chat[];
  title: string;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

const safeString = (val: unknown): string | undefined => typeof val === "string" ? val : undefined;

const ChatListItem: FC<{
  chat: Chat;
  currentUserId: string;
  selected: boolean;
  onSelect: (chatId: string) => void;
}> = ({ chat, currentUserId, selected, onSelect }) => {
  let avatar = null;
  const displayName = getChatDisplayName(chat, currentUserId);

  // Find the other member and their ID for 1:1 chats
  let otherMember: ConversationMember | undefined = undefined;
  if (chat.chatType === "oneOnOne" && Array.isArray(chat.members)) {
    otherMember = (chat.members as ConversationMember[]).find(m => m.id !== currentUserId);
  }
  // Type guard for AadUserConversationMember
  const getUserId = (member: ConversationMember | undefined): string | undefined => {
    if (member && 'userId' in member && typeof member.userId === 'string') {
      return member.userId;
    }
    return safeString(member?.id);
  };
  const userId = getUserId(otherMember);
  const { photoUrl } = useProfilePhoto(userId);

  if (chat.chatType === "oneOnOne" && otherMember) {
    avatar = (
      <div className="flex-shrink-0 h-6 w-6 rounded-sm bg-gray-500 flex items-center justify-center overflow-hidden mr-3">
        {photoUrl ? (
          <img src={photoUrl} alt={otherMember.displayName || "User"} className="h-full w-full object-cover" />
        ) : (
          <span className="text-white font-bold">{getInitials(otherMember.displayName ?? undefined)}</span>
        )}
      </div>
    );
  }
  // Add group chat avatar: show number of participants (excluding current user)
  if (chat.chatType === "group" && Array.isArray(chat.members)) {
    const participantCount = (chat.members as ConversationMember[]).filter(m => m.id !== currentUserId).length;
    avatar = (
      <div className="flex-shrink-0 h-6 w-6 rounded-sm bg-gray-500 flex items-center justify-center overflow-hidden mr-3">
        <span className="text-white font-bold text-xs">{participantCount}</span>
      </div>
    );
  }

  return (
    <div
      key={chat.id}
      onClick={() => chat.id && onSelect(chat.id)}
      className={cn(
        "cursor-pointer p-2 rounded hover:bg-white/10 flex items-center",
        selected && "bg-white/20 font-semibold"
      )}
    >
      {avatar}
      <div className="text-sm truncate">{displayName}</div>
    </div>
  );
};

export const ChatList: FC<ChatListProps> = ({ chats, title, onSelectChat, selectedChatId }) => {
  const { accounts } = useMsal();
  const currentUserId = accounts[0]?.localAccountId || accounts[0]?.homeAccountId || "";

  return (
    <div className="w-80 h-screen overflow-y-scroll border-r bg-[#4A154B] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="text-xl font-bold">{title}</div>
      </div>

      {/* Scrollable Chat List */}
      <div className="p-2 flex flex-col gap-1">
        {chats.map(chat => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            currentUserId={currentUserId}
            selected={selectedChatId === chat.id}
            onSelect={onSelectChat}
          />
        ))}
      </div>
    </div>
  );
}; 