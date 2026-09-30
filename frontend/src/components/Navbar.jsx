import React, { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, role } = useContext(AuthContext);
    const location = useLocation();

    // Map path to title
    const getPageTitle = (pathname) => {
        const path = pathname.split('/')[1];
        if (!path) return 'Welcome';
        
        const titles = {
            'dashboard': 'Dashboard Overview',
            'reports': 'Reports & Analytics',
            'purchases': 'Purchase History',
            'transfers': 'Asset Transfers',
            'assignments': 'Personnel Assignments',
            'expenditures': 'Expenditure Logs',
            'audit-logs': 'System Audit Logs',
            'login': 'Login',
            'register': 'Register'
        };
        
        return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    if (!isAuthenticated) {
        return (
            <header className="top-header auth-header">
                <div className="brand">MAMS</div>
                <div className="auth-links">
                    <Link to="/login" className="btn-secondary">Login</Link>
                    <Link to="/register" className="btn-primary">Register</Link>
                </div>
            </header>
        );
    }

    return (
        <header className="top-header">
            <div className="header-left">
                <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
                <div className="breadcrumb">
                    MAMS / {getPageTitle(location.pathname).split(' ')[0]}
                </div>
            </div>
            
            <div className="header-right">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search assets..." />
                </div>
                
                <button className="icon-btn notification-btn">
                    <Bell size={20} />
                    <span className="badge-dot"></span>
                </button>
                
                <div className="header-profile">
                    <div className="header-avatar">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
