import { createContext } from 'react';

/**
 * We separate Context definitions from Provider components to satisfy
 * React Fast Refresh rules, which require .jsx files to only export components.
 */

export const AppContext    = createContext();
export const ToastContext  = createContext();
export const UserContext   = createContext();
export const WalletContext  = createContext();
