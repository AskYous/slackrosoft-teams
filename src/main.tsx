import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AblyProvider, ChannelProvider } from "ably/react";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { ably } from "./services/ably.ts";

const msalInstance = new PublicClientApplication(msalConfig);

import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <AblyProvider client={ably}>
          <ChannelProvider channelName="slackrosoft-teams">
            <App />
          </ChannelProvider>
        </AblyProvider>
      </MsalProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
