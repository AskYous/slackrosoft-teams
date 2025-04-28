import { ChatMessage } from "@microsoft/microsoft-graph-types";
import { FC, useEffect, useRef, useState } from "react";
import { useChatMessages } from "../hooks/useChatMessages"; // Import the hook
import { Button } from "./ui/button"; // Assuming Button component exists
// import { Input } from "./ui/input"; // Removed - Using standard input

interface ChatWindowProps {
  chatId: string | null; // Accept chatId as a prop
}

export const ChatWindow: FC<ChatWindowProps> = ({ chatId }) => {
  const { messages, loading, error, sendMessage } = useChatMessages(chatId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null); // For scrolling

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll down when messages change
  }, [messages]);


  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage(""); // Clear input after sending
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, allow Shift+Enter for newline
      event.preventDefault(); // Prevent default Enter behavior (like form submission)
      handleSendMessage();
    }
  };


  // Placeholder - Implement chat message display and input later
  return (
    <div className="flex flex-col h-screen w-3/4 p-4 border-l">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">Chat Window</h3>

      {/* Message Display Area */}
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {!chatId ? (
          <div className="text-gray-500 text-center pt-10">Select a chat to start messaging.</div>
        ) : loading ? (
          <div className="text-gray-500 text-center pt-10">Loading messages...</div>
        ) : error ? (
          <div className="text-red-500 text-center pt-10">Error loading messages: {error.message}</div>
        ) : messages && messages.length > 0 ? (
          messages.map((message: ChatMessage) => (
            <div key={message.id} className="mb-3 p-2 rounded bg-secondary">
              <div className="text-xs font-semibold text-primary">{message.from?.user?.displayName || 'Unknown User'}</div>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: message.body?.content ?? '' }} />
              <div className="text-xs text-gray-400 text-right">{new Date(message.createdDateTime!).toLocaleString()}</div>
            </div>
          ))
        ) : messages ? (
          <div className="text-gray-500 text-center pt-10">No messages in this chat yet.</div>
        ) : (
          <div className="text-gray-500 text-center pt-10">Select a chat to view messages.</div> // Fallback
        )
        }
        <div ref={messagesEndRef} /> {/* Element to scroll to */}
      </div>

      {/* Message Input Area - Only show if a chat is selected */}
      {chatId && (
        <div className="mt-auto flex gap-2 border-t pt-4">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Add keydown handler
            className="flex-grow border rounded px-2 py-1" // Basic styling
            disabled={loading} // Disable input while loading/sending maybe?
          />
          <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}; 