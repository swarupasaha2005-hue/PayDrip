import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { WalletProvider } from './context/WalletContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

import { UserProvider } from './context/UserContext';
import ThemeProvider from './components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ThemeProvider>
          <ToastProvider>
            <WalletProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </WalletProvider>
          </ToastProvider>
        </ThemeProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

