import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SendTransaction from './pages/SendTransaction';
import Scheduler from './pages/Scheduler';
import Activity from './pages/Activity';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send" element={<SendTransaction />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/activity" element={<Activity />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
