import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import './App.css';
import { loginRequest } from "./authConfig";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { Button } from "./components/ui/button";
import { useChats } from "./hooks/useChats";

const App = () => {

  const { chats, loading, error } = useChats();

  return (
    <div className="flex justify-stretch w-full">
      <AuthenticatedTemplate>
        {loading && <div>Loading chats...</div>}
        {error && <div>Error loading chats: {error.message}</div>}
        {chats && <ChatList chats={chats} title="Innovation Team" />}
      </AuthenticatedTemplate>
      <div className="flex flex-row w-full p-2">
        <ChatWindow />
        <AuthBtns />
      </div>
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
  return <div className="w-full flex justify-end">
    <AuthenticatedTemplate>
      <Button onClick={handleLogout}>{accounts[0]?.name}</Button>
    </AuthenticatedTemplate>
    <UnauthenticatedTemplate>
      <Button onClick={handleLogin}>Sign In</Button>
    </UnauthenticatedTemplate>
  </div>;
}
  ;

export default App
