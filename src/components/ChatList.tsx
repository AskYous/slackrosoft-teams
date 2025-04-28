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

// Utility functions
const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getChatDisplayName = (chat: Chat, currentUserId: string) => {
  if (chat.topic) return chat.topic;
  if (chat.chatType === "oneOnOne" && Array.isArray(chat.members)) {
    const otherMember = (chat.members as ConversationMember[]).find(m => m.id !== currentUserId);
    return otherMember ? otherMember.displayName : "Chat";
  }
  if (chat.chatType === "group" && Array.isArray(chat.members)) {
    const names = (chat.members as ConversationMember[])
      .filter(m => m.id !== currentUserId)
      .map(m => m.displayName)
      .filter(Boolean);
    return names.length ? `${names.slice(0, 3).join(", ")}${names.length > 3 ? ", ..." : ""}` : "Group Chat";
  }
  return "Chat";
};

const isAadUserConversationMember = (member: ConversationMember | undefined): member is ConversationMember & { userId: string } => {
  return !!member && 'userId' in member && typeof (member as { userId?: unknown }).userId === 'string';
};

const getUserId = (member: ConversationMember | undefined): string | undefined => {
  if (isAadUserConversationMember(member)) {
    return member.userId;
  }
  return typeof member?.id === 'string' ? member.id : undefined;
};

// ChatAvatar component
const ChatAvatar: FC<{ chat: Chat; currentUserId: string }> = ({ chat, currentUserId }) => {
  let userId: string | undefined = undefined;
  let otherMember: ConversationMember | undefined = undefined;
  if (chat.chatType === "oneOnOne" && Array.isArray(chat.members)) {
    otherMember = (chat.members as ConversationMember[]).find(m => m.id !== currentUserId);
    userId = getUserId(otherMember);
  }
  const { photoUrl } = useProfilePhoto(userId);

  if (chat.chatType === "oneOnOne" && otherMember) {
    return (
      <div className="flex-shrink-0 h-6 w-6 rounded-sm bg-gray-500 flex items-center justify-center overflow-hidden mr-3">
        {photoUrl ? (
          <img src={photoUrl} alt={otherMember?.displayName || "User"} className="h-full w-full object-cover" />
        ) : (
          <span className="text-white font-bold">{getInitials(otherMember?.displayName ?? undefined)}</span>
        )}
      </div>
    );
  }
  if (chat.chatType === "group" && Array.isArray(chat.members)) {
    const participantCount = (chat.members as ConversationMember[]).filter(m => m.id !== currentUserId).length;
    return (
      <div className="flex-shrink-0 h-6 w-6 rounded-sm bg-gray-500 flex items-center justify-center overflow-hidden mr-3">
        <span className="text-white font-bold text-xs">{participantCount}</span>
      </div>
    );
  }
  return null;
};

const ChatListItem: FC<{
  chat: Chat;
  currentUserId: string;
  selected: boolean;
  onSelect: (chatId: string) => void;
}> = ({ chat, currentUserId, selected, onSelect }) => {
  const displayName = getChatDisplayName(chat, currentUserId);
  return (
    <div
      key={chat.id}
      onClick={() => chat.id && onSelect(chat.id)}
      className={cn(
        "cursor-pointer p-2 rounded hover:bg-white/10 flex items-center",
        selected && "bg-white/20 font-semibold"
      )}
    >
      <ChatAvatar chat={chat} currentUserId={currentUserId} />
      <div className="text-sm truncate">{displayName}</div>
    </div>
  );
};

export const ChatList: FC<ChatListProps> = ({ chats, title, onSelectChat, selectedChatId }) => {
  const { accounts } = useMsal();
  const currentUserId = accounts[0]?.localAccountId || accounts[0]?.homeAccountId || "";
  return (
    <div className="w-80 h-screen overflow-y-scroll border-r bg-[#4A154B] text-white flex flex-col">
      <div className="p-4 border-b border-white/20">
        <div className="text-xl font-bold">{title}</div>
      </div>
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