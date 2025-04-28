import { Chat } from "@microsoft/microsoft-graph-types";
import { ScrollArea } from "@radix-ui/react-scroll-area"; // Assuming ScrollArea is from radix-ui
import { FC } from "react";

interface ChatListProps {
  chats: Chat[];
}

export const ChatList: FC<ChatListProps> = ({ chats }) => {
  return (
    <ScrollArea className="w-80 h-screen border-r bg-primary text-accent flex flex-col gap-2 p-2">
      {chats.map(chat => (
        <div key={chat.id} className="cursor-pointer">
          {/* Consider adding more details or click handler later */}
          <div>{chat.topic ?? `Chat ${chat.id?.substring(0, 5)}`}</div>
        </div>
      ))}
    </ScrollArea>
  );
}; 