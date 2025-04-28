import { ChatMessage } from "@microsoft/microsoft-graph-types";
import { FC, useEffect, useRef } from "react";

interface MessageListProps {
  chatId: string | null;
  messages: ChatMessage[] | null;
  loading: boolean;
  error: Error | null;
}

// Separate component for rendering a single message
const MessageItem: FC<{ message: ChatMessage }> = ({ message }) => (
  <div key={message.id} className="mb-3 p-2 rounded bg-secondary">
    <div data-testid="message-from" className="text-xs font-semibold text-primary">
      {message.from?.user?.displayName || 'Unknown User'}
    </div>
    <div
      data-testid="message-body"
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: message.body?.content ?? '' }}
    />
    <div data-testid="message-timestamp" className="text-xs text-gray-400 text-right">
      {new Date(message.createdDateTime!).toLocaleString()}
    </div>
  </div>
);

export const MessageList: FC<MessageListProps> = ({ chatId, messages, loading, error }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll down when messages change
  }, [messages]);

  const renderContent = () => {
    if (!chatId) {
      return (
        <div data-testid="select-chat" className="text-gray-500 text-center pt-10">
          Select a chat to start messaging.
        </div>
      );
    }
    if (loading) {
      return (
        <div data-testid="loading" className="text-gray-500 text-center pt-10">
          Loading messages...
        </div>
      );
    }
    if (error) {
      return (
        <div data-testid="error" className="text-red-500 text-center pt-10">
          Error loading messages: {error.message}
        </div>
      );
    }
    if (messages && messages.length > 0) {
      return messages.map((message) => <MessageItem key={message.id} message={message} />);
    }
    if (messages) { // messages is not null, but length is 0
      return (
        <div data-testid="no-messages" className="text-gray-500 text-center pt-10">
          No messages in this chat yet.
        </div>
      );
    }
    // Default/fallback case (should ideally not be reached if logic is sound)
    return (
      <div data-testid="select-chat-fallback" className="text-gray-500 text-center pt-10">
        Select a chat to view messages.
      </div>
    );
  };

  return (
    <div data-testid="message-display" className="flex-grow overflow-y-auto mb-4 pr-2">
      {renderContent()}
      <div ref={messagesEndRef} /> {/* Element to scroll to */}
    </div>
  );
}; 