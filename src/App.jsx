import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ManageSubscriptions from './pages/ManageSubscriptions';
import SmartPlanner from './pages/SmartPlanner';
import Activity from './pages/Activity';
import ContractView from './pages/ContractView';
import Vault from './pages/Vault';
import Metrics from './pages/Metrics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscriptions" element={<ManageSubscriptions />} />
        <Route path="/planner" element={<SmartPlanner />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/contract-view" element={<ContractView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
