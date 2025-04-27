import { Chat } from "@microsoft/microsoft-graph-types";
import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { cn } from "../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const ChatList = ({ onSelectChat, selectedChatId }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { getGraphClient, isLoading, error } = useGraph();

  const fetchChats = useCallback(async () => {
    try {
      const graphClient = await getGraphClient();
      const chatList = await graphClient.getChats();
      setChats(chatList || []);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }, [getGraphClient]);

  // Type guard to check for error with message property
  const isErrorWithMessage = (error: unknown): error is { message: string } => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    );
  };

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.topic) {
      return chat.topic;
    }
    if (chat.members && chat.members.length > 0) {
      const members = chat.members.filter(m => m.displayName);
      if (members.length > 0) {
        return members.map(m => m.displayName).join(", ");
      }
    }
    return "Unnamed chat";
  };

  // Helper function to format date/time or return placeholder
  const formatLastUpdated = (dateTime: string | undefined | null): string => {
    if (!dateTime) return "";
    try {
      return new Date(dateTime).toLocaleString([], {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 space-y-1">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-md">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {isErrorWithMessage(error) ? error.message : String(error ?? 'Unknown error')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1">
      {chats.length === 0 ? (
        <p className="px-2 py-2 text-sm text-muted-foreground">No chats found</p>
      ) : (
        chats.map((chat) => {
          const isSelected = selectedChatId === chat.id;
          const displayName = getChatDisplayName(chat);
          const lastUpdated = formatLastUpdated(chat.lastUpdatedDateTime);

          return (
            <Button
              key={chat.id}
              variant="ghost"
              onClick={() => onSelectChat(chat.id!)}
              className={cn(
                "h-auto py-1.5 px-2 text-left",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              title={`${displayName}
Last updated: ${lastUpdated}`}
            >
              {/* Chat Title / Name */}
              <span className="text-sm font-medium truncate mr-2">
                {displayName}
              </span>
              {/* Last Updated Time */}
              <span className={cn(
                "text-xs flex-shrink-0",
                isSelected ? "text-accent-foreground/80" : "text-muted-foreground"
              )}>
                {lastUpdated}
              </span>
            </Button>
          );
        })
      )}
    </div>
  );
};

export default ChatList; 