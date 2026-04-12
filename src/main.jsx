import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { WalletProvider } from './context/WalletContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <WalletProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </WalletProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
