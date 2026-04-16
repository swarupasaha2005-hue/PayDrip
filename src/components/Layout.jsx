import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Header Bar */}
        <header style={{ 
          padding: '24px 36px 0', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center' 
        }}>
          <NotificationPanel />
        </header>

        <div className="content-grid" style={{ padding: '24px 36px', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

