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
    <div>
      <AuthenticatedTemplate>
        <Button onClick={handleLogout}>Sign Out</Button>
        <div className="flex">
          {loading && <div>Loading chats...</div>}
          {error && <div>Error loading chats: {error.message}</div>}
          {chats && <ChatList chats={chats} />}
          <ChatWindow />
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button onClick={handleLogin}>Sign In</Button>
      </UnauthenticatedTemplate>
    </div>
  )
}

export default App
