import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import './App.css';
import { loginRequest } from "./authConfig";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { Button } from "./components/ui/button";
import { useChats } from "./hooks/useChats";

const App = () => {
  const { instance } = useMsal();

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

  const { chats, loading, error } = useChats();

  return (
    <>
      <div className="w-full flex justify-end">
        <AuthenticatedTemplate>
          <Button onClick={handleLogout}>Sign Out</Button>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Button onClick={handleLogin}>Sign In</Button>
        </UnauthenticatedTemplate>
      </div>
      <AuthenticatedTemplate>
        <div className="flex">
          {loading && <div>Loading chats...</div>}
          {error && <div>Error loading chats: {error.message}</div>}
          {chats && <ChatList chats={chats} />}
          <ChatWindow />
        </div>
      </AuthenticatedTemplate>
    </>
  )
}

export default App
