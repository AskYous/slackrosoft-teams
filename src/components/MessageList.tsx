import { ChatMessage } from "@microsoft/microsoft-graph-types";
import { FC, useEffect, useRef } from "react";
import { useProfilePhoto } from "../hooks/useProfilePhoto";

interface MessageListProps {
  chatId: string | null;
  messages: ChatMessage[] | null;
  loading: boolean;
  error: Error | null;
}

// Helper function to get initials from a name
const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const nameParts = name.trim().split(' ');
  // Handle cases with empty strings after split
  const validParts = nameParts.filter(part => part.length > 0);
  if (validParts.length === 0) return '?';
  if (validParts.length === 1) {
    return validParts[0].charAt(0).toUpperCase();
  }
  return (
    (validParts[0].charAt(0) ?? '') + (validParts[validParts.length - 1].charAt(0) ?? '')
  ).toUpperCase();
};

// Separate component for rendering a single message
const MessageItem: FC<{ message: ChatMessage }> = ({ message }) => {
  // Get the user ID from the message sender
  const userId = message.from?.user?.id;
  // Fetch the profile photo using the hook
  const { photoUrl, loading: photoLoading, error: photoError } = useProfilePhoto(userId);

  // Log photo loading errors for debugging
  useEffect(() => {
    if (photoError) {
      console.error(`Failed to load photo for user ${userId}:`, photoError);
    }
  }, [photoError, userId]);

  return (
    <div key={message.id} className="flex items-start gap-3 mb-2"> {/* Outer container: Avatar + Message Bubble */}
      {/* Avatar: Show photo or fallback to initials */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-white overflow-hidden"> {/* Added overflow-hidden */}
        {photoLoading ? (
          <span className="text-gray-500 text-xs">...</span> // Simple loading indicator
        ) : photoUrl ? (
          <img src={photoUrl} alt={`${message.from?.user?.displayName ?? 'User'} profile`} className="h-full w-full object-cover" />
        ) : (
          // Fallback to initials if no photo URL or error
          getInitials(message.from?.user?.displayName)
        )}
      </div>
      {/* Message Bubble */}
      <div className="flex max-w-[85%] flex-col gap-1 rounded-lg bg-muted px-3 py-2 text-sm"> {/* Adjusted gap, max-width */}
        {/* From */}
        <div data-testid="message-from" className="text-xs font-semibold text-primary">
          {message.from?.user?.displayName ?? 'Unknown User'}
        </div>
        {/* Body */}
        <div
          data-testid="message-body"
          className="text-sm break-words" // Added break-words for long content
          dangerouslySetInnerHTML={{ __html: message.body?.content ?? '' }}
        />
        {/* Timestamp */}
        <div data-testid="message-timestamp" className="mt-1 text-right text-xs text-gray-400"> {/* Added margin-top */}
          {new Date(message.createdDateTime!).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

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
    <div data-testid="message-display" className="flex-grow overflow-y-auto mb-4 pr-2 flex flex-col"> {/* Removed gap-2 here, added to MessageItem parent */}
      {renderContent()}
      <div ref={messagesEndRef} /> {/* Element to scroll to */}
    </div>
  );
}; 