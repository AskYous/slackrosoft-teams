import React from 'react';

const MsalErrorDisplay: React.FC = () => {
  return (
    <div className="p-5 text-red-600">
      <h1 className="text-2xl font-bold mb-3">Authentication Error</h1>
      <p>Failed to initialize authentication. Please check your configuration and try again.</p>
      <p className="mt-4">Make sure all environment variables are correctly set in your .env file.</p>
    </div>
  );
};

export default MsalErrorDisplay; 