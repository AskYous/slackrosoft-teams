import { MsalProvider } from "@azure/msal-react";
import AppContentWrapper from "./components/AppContentWrapper";
import MsalErrorDisplay from "./components/MsalErrorDisplay";
import { msalInstance } from "./config/msal";

const App = () => {
  // If MSAL failed to initialize, show an error
  if (!msalInstance) {
    return <MsalErrorDisplay />;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <div className="min-h-screen bg-gray-50">
        <AppContentWrapper />
      </div>
    </MsalProvider>
  );
};

export default App;
