import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { Chat } from "@microsoft/microsoft-graph-types";
import { useState } from "react";
import './App.css';
import { loginRequest } from "./authConfig";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { Button } from "./components/ui/button";
import { useChats } from "./hooks/useChats";

const App = () => {
  const { chats, loading, error } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const selectedChat: Chat | null = chats?.find(chat => chat.id === selectedChatId) || null;

  return (
    <div className="flex h-screen w-full bg-background text-primary">
      <AuthenticatedTemplate>
        <div data-testid="left" className="flex-none">
          {loading && <div>Loading chats...</div>}
          {error && <div>Error loading chats: {error.message}</div>}
          {chats && (
            <ChatList
              chats={chats}
              title="Teams Chats"
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChatId}
            />
          )}
          {!loading && !error && !chats && <div>No chats found or unable to load.</div>}
        </div>
        <div data-testid="right" className="flex flex-col justify-stretch h-screen w-full overflow-hidden">
          <AuthBtns />
          <ChatWindow selectedChat={selectedChat} />
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div className="w-full h-full flex flex-col justify-center items-center">
          <p className="mb-4">Please sign in to view your chats.</p>
          <AuthBtns />
        </div>
      </UnauthenticatedTemplate>
    </div>
  )
}

const AuthBtns = () => {
  const { instance, accounts } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error(e);
    });
  }

  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error(e);
    });
  }
  return <div className="flex justify-end items-center">
    <AuthenticatedTemplate>
      <span className="mr-2 text-sm text-muted-foreground">{accounts[0]?.name}</span>
      <Button onClick={handleLogout} variant="outline" size="sm">Sign Out</Button>
    </AuthenticatedTemplate>
    <UnauthenticatedTemplate>
      <Button onClick={handleLogin}>Sign In</Button>
    </UnauthenticatedTemplate>
  </div>;
}

export default App
