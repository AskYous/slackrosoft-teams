import { FC } from "react";
import { getChat } from "../lib/chats";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";

export const ChatApp: FC<{ chatId?: string }> = async ({ chatId }) => {
  const selectedChat = chatId ? await getChat(chatId) : undefined;

  return (
    <div className="w-full flex">
      <div>
        <ChatList />
      </div>
      <div>
        <ChatWindow chat={selectedChat} />
      </div>
    </div>
  );
};
