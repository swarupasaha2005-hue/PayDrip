import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ManageSubscriptions from './pages/ManageSubscriptions';
import Activity from './pages/Activity';
import ContractView from './pages/ContractView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscriptions" element={<ManageSubscriptions />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/contract-view" element={<ContractView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
