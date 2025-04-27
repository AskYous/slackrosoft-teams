import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";

const LoginButton = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Sign in with Microsoft
    </button>
  );
};

export default LoginButton; 