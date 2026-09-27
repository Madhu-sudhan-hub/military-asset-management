import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { role } = useContext(AuthContext);

    // ADMIN sees all, BASE_COMMANDER and LOGISTICS_OFFICER have restricted menus
    const canSeeAssignments = role === 'ADMIN' || role === 'BASE_COMMANDER';
    const canSeeExpenditures = role === 'ADMIN' || role === 'BASE_COMMANDER';

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/dashboard" className={({isActive}) => isActive ? "active-link" : ""}>Dashboard</NavLink>
                </li>
                <li>
                    <NavLink to="/reports" className={({isActive}) => isActive ? "active-link" : ""}>Reports</NavLink>
                </li>
                <li>
                    <NavLink to="/purchases" className={({isActive}) => isActive ? "active-link" : ""}>Purchases</NavLink>
                </li>
                <li>
                    <NavLink to="/transfers" className={({isActive}) => isActive ? "active-link" : ""}>Transfers</NavLink>
                </li>
                {canSeeAssignments && (
                    <li>
                        <NavLink to="/assignments" className={({isActive}) => isActive ? "active-link" : ""}>Assignments</NavLink>
                    </li>
                )}
                {canSeeExpenditures && (
                    <li>
                        <NavLink to="/expenditures" className={({isActive}) => isActive ? "active-link" : ""}>Expenditures</NavLink>
                    </li>
                )}
                {role === 'ADMIN' && (
                    <li>
                        <NavLink to="/audit-logs" className={({isActive}) => isActive ? "active-link" : ""}>Audit Logs</NavLink>
                    </li>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;
