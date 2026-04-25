import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';

export default function Layout() {
  return (
    <>
      {/* Main Glass App Overlay */}
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header Bar */}
          <header style={{ 
            padding: '40px 56px 0', 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            <NotificationPanel />
          </header>

          <div className="content-grid" style={{ flex: 1, width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
