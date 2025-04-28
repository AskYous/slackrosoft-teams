import { FC } from "react";
import { useChatMessages } from "../hooks/useChatMessages";
import { MessageInput } from "./MessageInput"; // Import new component
import { MessageList } from "./MessageList"; // Import new component
// Removed unused imports: useEffect, useRef, useState, ChatMessage, Button

interface ChatWindowProps {
  chatId: string | null;
}

export const ChatWindow: FC<ChatWindowProps> = ({ chatId }) => {
  const { messages, loading, error, sendMessage } = useChatMessages(chatId);

  // The handleSendMessage logic is now within MessageInput, but we pass the sendMessage function
  const handleSendMessage = (messageContent: string) => {
    if (chatId) { // Ensure chatId is present before sending
      sendMessage(messageContent);
    }
  };

  // Scroll logic is now within MessageList

  return (
    <div data-testid="chat-window" className="flex flex-col p-4 border-l flex-grow overflow-hidden">
      <h3 className="text-lg font-bold mb-4 border-b pb-2 flex-shrink-0">Chat Window</h3>

      {/* Message Display Area - Add wrapper for scrolling */}
      <div className="flex-grow overflow-y-auto mb-4">
        <MessageList
          chatId={chatId}
          messages={messages}
          loading={loading}
          error={error}
        />
      </div>

      {/* Message Input Area - Uses MessageInput, only show if a chat is selected */}
      {chatId && (
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading} // Disable input while loading messages
        />
      )}
    </div>
  );
}; 