import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Root = () => {
  const isGoogleConfigured = GOOGLE_CLIENT_ID && 
    GOOGLE_CLIENT_ID !== "your_google_client_id_here.apps.googleusercontent.com" &&
    !GOOGLE_CLIENT_ID.includes("your_google_client_id_here");

  return (
    <StrictMode>
      {isGoogleConfigured ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Root />);

