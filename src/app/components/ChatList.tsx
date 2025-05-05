import { getChats } from "../lib/chats";
import { ChatListItem } from "./ChatListItem";

export const ChatList = async () => {
  const chats = await getChats();
  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {chats.map((chat) => (
        <ChatListItem
          topic={chat.topic ?? "Unnamed chat"}
          id={chat.id ?? ""}
          key={chat.id}
        />
      ))}
    </div>
  );
};
