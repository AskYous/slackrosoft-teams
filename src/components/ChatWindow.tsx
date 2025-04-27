import { useCallback, useEffect, useRef, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { safeRenderContent } from "../utils/renderUtils";

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
  const { getGraphClient, isLoading, error } = useGraph();
  const messageContainerRef = useRef<HTMLDivElement>(null);

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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b font-medium">
        Chat {chatId}
      </div>
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border rounded-lg p-3">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">
                    {message.from?.user
                      ? safeRenderContent(message.from.user.displayName)
                      : "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {message.createdDateTime
                      ? new Date(message.createdDateTime).toLocaleString()
                      : "Unknown time"}
                  </div>
                </div>
                <div>
                  {message.body?.content
                    ? safeRenderContent(message.body.content)
                    : "No content"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow; 