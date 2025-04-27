import { useCallback, useEffect, useRef, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { safeRenderContent } from "../utils/renderUtils";
// Added imports for Shadcn UI components if needed (example: Avatar)
// import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface ChatWindowProps {
  chatId: string;
}

// Define a more flexible Message interface
interface Message {
  id?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  deletedDateTime?: string | null;
  subject?: string | null;
  body?: {
    contentType?: string;
    content?: string | unknown;
  };
  from?: {
    user?: {
      id?: string;
      displayName?: string | unknown;
      userIdentityType?: string;
    };
  };
}

const ChatWindow = ({ chatId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { getGraphClient, isLoading, error, accounts } = useGraph();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = accounts.length > 0 ? accounts[0].homeAccountId.split('.')[0] : null;

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const graphClient = await getGraphClient();
      const chatMessages = await graphClient.getChatMessages(chatId);
      console.log("Raw chat messages:", JSON.stringify(chatMessages, null, 2));
      setMessages(chatMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [chatId, getGraphClient]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a chat to view messages
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-inner">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200">
        Chat: {chatId.substring(0, 8)}...
      </div>
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 pt-10">No messages in this chat yet.</div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.from?.user?.id === currentUserId;
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                  {!isCurrentUser && (
                    <div className="font-semibold text-xs mb-1 text-gray-700 dark:text-gray-300">
                      {message.from?.user
                        ? safeRenderContent(message.from.user.displayName)
                        : "Unknown User"}
                    </div>
                  )}
                  <div className="text-sm">
                    {message.body?.content
                      ? safeRenderContent(message.body.content)
                      : <span className="italic text-gray-400 dark:text-gray-500">No content</span>}
                  </div>
                  <div className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {message.createdDateTime
                      ? new Date(message.createdDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isLoading && <div className="text-center text-gray-500 dark:text-gray-400 py-4">Loading more messages...</div>}
      </div>
    </div>
  );
};

export default ChatWindow; 