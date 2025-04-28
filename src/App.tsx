import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import './App.css';
import { loginRequest } from "./authConfig";
import { Button } from "./components/ui/button";

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

  return (
    <div>
      <AuthenticatedTemplate>
        <Button onClick={handleLogout}>Sign Out</Button>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button onClick={handleLogin}>Sign In</Button>
      </UnauthenticatedTemplate>
    </div>
  )
}

export default App
