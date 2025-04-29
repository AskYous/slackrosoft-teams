import { useMsal } from "@azure/msal-react"; // Needed for currentUserAadId
import { Chat, ConversationMember } from "@microsoft/microsoft-graph-types"; // Add Chat type
import { FC } from "react";
import { useChatMessages } from "../hooks/useChatMessages";
import { usePresence } from "../hooks/usePresence"; // Import usePresence
import { ChatAvatar, getChatDisplayName, getUserId, isAadUserConversationMember } from "./ChatList"; // Import necessary items
import { MessageInput } from "./MessageInput"; // Import new component
import { MessageList } from "./MessageList"; // Import new component

interface ChatWindowProps {
  // chatId: string | null; // Keep chatId for useChatMessages hook
  selectedChat: Chat | null; // Add selectedChat prop
}

export const ChatWindow: FC<ChatWindowProps> = ({ selectedChat }) => {
  // Use selectedChat?.id which can be null
  const chatId = selectedChat?.id ?? null;
  const { messages, loading, sending, error, sendMessage } = useChatMessages(chatId);
  const { accounts } = useMsal(); // Get accounts for current user ID
  const currentUserAadId = accounts[0]?.idTokenClaims?.oid || accounts[0]?.idTokenClaims?.sub || "";

  // --- Presence Logic ---
  let otherUserId: string | undefined = undefined;
  if (selectedChat?.chatType === 'oneOnOne' && Array.isArray(selectedChat.members)) {
    const otherMember = (selectedChat.members as ConversationMember[]).find(
      m => isAadUserConversationMember(m) && m.userId !== currentUserAadId
    );
    otherUserId = getUserId(otherMember);
  }
  const { presence } = usePresence(otherUserId); // Fetch presence for the other user
  // --- End Presence Logic ---

  // The handleSendMessage logic is now within MessageInput, but we pass the sendMessage function
  const handleSendMessage = (messageContent: string) => {
    if (chatId) { // Ensure chatId is present before sending
      sendMessage(messageContent);
    }
  };

  // Scroll logic is now within MessageList

  const displayName = selectedChat ? getChatDisplayName(selectedChat, currentUserAadId) : "Select a chat";

  return (
    <div data-testid="chat-window" className="flex flex-col p-4 border-l flex-grow overflow-hidden">
      {/* Updated Header */}
      <div className="flex items-center mb-4 border-b pb-2 flex-shrink-0">
        {selectedChat && (
          <div className="relative mr-3"> {/* Wrapper for avatar + presence */}
            <ChatAvatar chat={selectedChat} currentUserAadId={currentUserAadId} />
          </div>
        )}
        <h3 className="text-lg font-bold">{displayName}</h3> {/* Removed ml-3 as wrapper provides margin */}
      </div>


      {/* Message Display Area - Add wrapper for scrolling */}
      <div className="flex-grow overflow-y-auto mb-4">
        {selectedChat ? (
          <MessageList
            chatId={chatId}
            messages={messages}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging.
          </div>
        )}
      </div>

      {/* Message Input Area - Uses MessageInput, only show if a chat is selected */}
      {selectedChat && ( // Use selectedChat to determine if input should show
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sending} // Use sending state for input disabling
        />
      )}
    </div>
  );
}; 