import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../routes'; // Adjust path as needed

const AppContentWrapper: React.FC = () => {
  const { inProgress } = useMsal();

  // Wait for MSAL initialization/interaction to complete
  if (inProgress !== InteractionStatus.None) {
    // Optionally return a loading indicator
    // e.g., return <div>Loading...</div>;
    return null;
  }

  // Render the main app content once MSAL is ready
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default AppContentWrapper; 