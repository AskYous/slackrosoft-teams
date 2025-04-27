import { useMsal } from "@azure/msal-react";

const LogoutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
      title="Sign out"
    >
      Sign Out
    </button>
  );
};

export default LogoutButton; 