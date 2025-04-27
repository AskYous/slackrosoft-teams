import { useMsal } from "@azure/msal-react";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      title="Sign out"
    >
      Sign Out
    </Button>
  );
};

export default LogoutButton; 