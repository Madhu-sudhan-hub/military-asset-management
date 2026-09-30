import React, { useContext } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppLayout = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <div className="app-layout">
            {isAuthenticated && <Sidebar />}
            <div className="main-content">
                <Navbar />
                <div className="page-container">
                    <AppRoutes />
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout />
            </Router>
        </AuthProvider>
    );
}

export default App;
