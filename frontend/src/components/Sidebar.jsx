import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    ShoppingCart, 
    ArrowRightLeft, 
    ClipboardList, 
    Banknote, 
    ShieldAlert,
    LogOut,
    Shield
} from 'lucide-react';

const Sidebar = () => {
    const { role, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const canSeeAssignments = role === 'ADMIN' || role === 'BASE_COMMANDER';
    const canSeeExpenditures = role === 'ADMIN' || role === 'BASE_COMMANDER';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <Shield className="brand-icon" size={28} />
                    <div className="brand-text">
                        <h2>MAMS</h2>
                        <span>Military Asset Management</span>
                    </div>
                </div>
            </div>

            <ul className="sidebar-nav">
                <li>
                    <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                        <FileText size={20} />
                        <span>Reports</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/purchases" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                        <ShoppingCart size={20} />
                        <span>Purchases</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/transfers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                        <ArrowRightLeft size={20} />
                        <span>Transfers</span>
                    </NavLink>
                </li>
                {canSeeAssignments && (
                    <li>
                        <NavLink to="/assignments" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                            <ClipboardList size={20} />
                            <span>Assignments</span>
                        </NavLink>
                    </li>
                )}
                {canSeeExpenditures && (
                    <li>
                        <NavLink to="/expenditures" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                            <Banknote size={20} />
                            <span>Expenditures</span>
                        </NavLink>
                    </li>
                )}
                {role === 'ADMIN' && (
                    <li>
                        <NavLink to="/audit-logs" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                            <ShieldAlert size={20} />
                            <span>Audit Logs</span>
                        </NavLink>
                    </li>
                )}
            </ul>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.username}</span>
                        <span className="user-role">{role?.replace('_', ' ')}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-icon-logout" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
