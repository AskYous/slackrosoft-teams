import { Chat } from "@microsoft/microsoft-graph-types";
import { ScrollArea } from "@radix-ui/react-scroll-area"; // Assuming ScrollArea is from radix-ui
import { FC } from "react";

interface ChatListProps {
  chats: Chat[];
}

export const ChatList: FC<ChatListProps> = ({ chats }) => {
  return (
    <ScrollArea className="w-1/4 h-screen border-r">
      <h3 className="text-lg font-bold text-start p-2">Chats</h3>
      {chats.map(chat => (
        <div key={chat.id} className="p-2 border-b cursor-pointer hover:bg-gray-100">
          {/* Consider adding more details or click handler later */}
          <div>{chat.topic || `Chat ${chat.id?.substring(0, 5)}`}</div>
        </div>
      ))}
    </ScrollArea>
  );
}; 