import { cn } from "@/lib/utils"; // Assuming shadcn/ui utility for conditional classes
import { useMsal } from "@azure/msal-react";
import { Chat, ConversationMember } from "@microsoft/microsoft-graph-types";
import { FC } from "react";
import { usePresence } from "../hooks/usePresence"; // Import usePresence hook
import { useProfilePhoto } from "../hooks/useProfilePhoto";
import { PresenceIndicator } from "./ui/PresenceIndicator"; // Import PresenceIndicator

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

export const isAadUserConversationMember = (member: ConversationMember | undefined): member is ConversationMember & { userId: string } => {
  return !!member && 'userId' in member && typeof (member as { userId?: unknown }).userId === 'string';
};

export const getUserId = (member: ConversationMember | undefined): string | undefined => {
  if (isAadUserConversationMember(member)) {
    return member.userId;
  }
  return typeof member?.id === 'string' ? member.id : undefined;
};

// ChatAvatar component
export const ChatAvatar: FC<{ chat: Chat; currentUserAadId: string }> = ({ chat, currentUserAadId }) => {
  let userId: string | undefined = undefined;
  let otherMember: ConversationMember | undefined = undefined;
  if (chat.chatType === "oneOnOne" && Array.isArray(chat.members)) {
    otherMember = (chat.members as ConversationMember[]).find(
      m => isAadUserConversationMember(m) && m.userId !== currentUserAadId
    );
    userId = getUserId(otherMember);
  }
  const { photoUrl } = useProfilePhoto(userId);
  const { presence } = usePresence(userId); // Fetch presence for the other user

  if (chat.chatType === "oneOnOne" && otherMember) {
    return (
      <div className="relative flex-shrink-0 h-6 w-6 rounded-sm bg-gray-500 flex items-center justify-center overflow-visible mr-3"> {/* Increased size slightly & allow overflow */}
        {photoUrl ? (
          <img src={photoUrl} alt={otherMember?.displayName || "User"} className="h-full w-full object-cover rounded-sm" />
        ) : (
          <span className="text-white font-bold">{getInitials(otherMember?.displayName ?? undefined)}</span>
        )}
        {presence && (
          <PresenceIndicator
            availability={presence.availability ?? undefined}
            className="absolute bottom-[-2px] right-[-2px]"
          />
        )}
      </div>
    );
  }
  if (chat.chatType === "group" && Array.isArray(chat.members)) {
    const participantCount = (chat.members as ConversationMember[]).filter(
      m => isAadUserConversationMember(m) && m.userId !== currentUserAadId
    ).length;
    return (
      <div className="flex-shrink-0 h-6 w-6 rounded-sm bg-gray-500 flex items-center justify-center overflow-hidden mr-3">
        <span className="text-white font-bold text-xs">{participantCount}</span>
      </div>
    );
  }
  return null;
};

export const getChatDisplayName = (chat: Chat, currentUserAadId: string) => {
  if (chat.topic) return chat.topic;
  if (chat.chatType === "oneOnOne" && Array.isArray(chat.members)) {
    const otherMember = (chat.members as ConversationMember[]).find(
      m => isAadUserConversationMember(m) && m.userId !== currentUserAadId
    );
    return otherMember ? otherMember.displayName : "Chat";
  }
  if (chat.chatType === "group" && Array.isArray(chat.members)) {
    const names = (chat.members as ConversationMember[])
      .filter(m => isAadUserConversationMember(m) && m.userId !== currentUserAadId)
      .map(m => m.displayName)
      .filter(Boolean);
    return names.length ? `${names.slice(0, 3).join(", ")}${names.length > 3 ? ", ..." : ""}` : "Group Chat";
  }
  return "Chat";
};

const ChatListItem: FC<{
  chat: Chat;
  currentUserAadId: string;
  selected: boolean;
  onSelect: (chatId: string) => void;
}> = ({ chat, currentUserAadId, selected, onSelect }) => {
  const displayName = getChatDisplayName(chat, currentUserAadId);
  return (
    <div
      key={chat.id}
      onClick={() => chat.id && onSelect(chat.id)}
      className={cn(
        "cursor-pointer p-2 rounded hover:bg-white/10 flex items-center",
        selected && "bg-white/20 font-semibold"
      )}
    >
      <ChatAvatar chat={chat} currentUserAadId={currentUserAadId} />
      <div className="text-sm truncate">{displayName}</div>
    </div>
  );
};

export const ChatList: FC<ChatListProps> = ({ chats, title, onSelectChat, selectedChatId }) => {
  const { accounts } = useMsal();
  const currentUserAadId = accounts[0]?.idTokenClaims?.oid || accounts[0]?.idTokenClaims?.sub || "";
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
            currentUserAadId={currentUserAadId}
            selected={selectedChatId === chat.id}
            onSelect={onSelectChat}
          />
        ))}
      </div>
    </div>
  );
}; 