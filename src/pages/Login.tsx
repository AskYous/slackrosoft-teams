import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginButton from "../components/LoginButton";

const Login = () => {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already logged in
    if (accounts.length > 0) {
      navigate("/");
    }
  }, [accounts, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">MS Teams Chat Manager</h1>
        <p className="text-gray-600">Sign in with your Microsoft account to manage your Teams chats</p>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <LoginButton />
      </div>
    </div>
  );
};

export default Login; 