import React, { useContext } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppLayout = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <div className="app-container">
            <Navbar />
            <div className={`app-body ${isAuthenticated ? 'has-sidebar' : ''}`}>
                {isAuthenticated && <Sidebar />}
                <main className="main-content">
                    <AppRoutes />
                </main>
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
