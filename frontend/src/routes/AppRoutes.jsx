import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Unauthorized from '../pages/Unauthorized';

import Purchases from '../pages/Purchases';
import Transfers from '../pages/Transfers';
import NewTransfer from '../pages/NewTransfer';
import Assignments from '../pages/Assignments';
import NewAssignment from '../pages/NewAssignment';
import Expenditures from '../pages/Expenditures';
import NewExpenditure from '../pages/NewExpenditure';

import Dashboard from '../pages/Dashboard';
import AuditLogs from '../pages/AuditLogs';
import Reports from '../pages/Reports';

// Placeholder Pages
const Profile = () => <div className="page-content"><h2>Profile</h2><p>Coming Soon</p></div>;

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes for All Authenticated Users */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/transfers/new" element={<NewTransfer />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected Routes for ADMIN and BASE_COMMANDER */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']} />}>
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/assignments/new" element={<NewAssignment />} />
                <Route path="/expenditures" element={<Expenditures />} />
                <Route path="/expenditures/new" element={<NewExpenditure />} />
            </Route>

            {/* Protected Routes for ADMIN ONLY */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
