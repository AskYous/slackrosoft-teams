import { PublicClientApplication } from "@azure/msal-browser";
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate } from "@azure/msal-react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { msalConfig } from "./config/authConfig";
import Home from "./pages/Home";
import Login from "./pages/Login";

// Initialize MSAL with try/catch for better error handling
let msalInstance;
try {
  console.log('Initializing MSAL with config:', JSON.stringify({
    clientId: msalConfig.auth.clientId,
    authority: msalConfig.auth.authority,
    redirectUri: msalConfig.auth.redirectUri
  }));

  msalInstance = new PublicClientApplication(msalConfig);
  console.log('MSAL instance created successfully');
} catch (error) {
  console.error('Failed to initialize MSAL:', error);
  msalInstance = null;
}

const App = () => {
  // If MSAL failed to initialize, show an error
  if (!msalInstance) {
    return (
      <div className="p-5 text-red-600">
        <h1 className="text-2xl font-bold mb-3">Authentication Error</h1>
        <p>Failed to initialize authentication. Please check your configuration and try again.</p>
        <p className="mt-4">Make sure all environment variables are correctly set in your .env file.</p>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <div className="min-h-screen bg-gray-50">
        <Router>
          <Routes>
            <Route path="/login" element={
              <UnauthenticatedTemplate>
                <Login />
              </UnauthenticatedTemplate>
            } />
            <Route path="/" element={
              <>
                <AuthenticatedTemplate>
                  <Home />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                  <div className="p-5">
                    <p>Please sign in to access this application</p>
                    <Navigate to="/login" replace />
                  </div>
                </UnauthenticatedTemplate>
              </>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>
    </MsalProvider>
  );
};

export default App;
