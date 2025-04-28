import { Chat } from "@microsoft/microsoft-graph-types";
import { ScrollArea } from "@radix-ui/react-scroll-area"; // Assuming ScrollArea is from radix-ui
import { FC } from "react";

interface ChatListProps {
  chats: Chat[];
  title: string;
}

export const ChatList: FC<ChatListProps> = ({ chats, title }) => {
  return (
    <ScrollArea className="w-80 h-screen border-r bg-primary text-accent flex flex-col gap-2 px-4 py-3">
      <div className="text-2xl font-bold">{title}</div>
      {chats.map(chat => (
        <div key={chat.id} className="cursor-pointer">
          {/* Consider adding more details or click handler later */}
          <div>{chat.topic ?? `Chat ${chat.id?.substring(0, 5)}`}</div>
        </div>
      ))}
    </ScrollArea>
  );
}; 