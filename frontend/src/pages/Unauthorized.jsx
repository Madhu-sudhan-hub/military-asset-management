import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="message-container">
            <div className="message-card">
                <h1>403 Forbidden</h1>
                <p>You do not have permission to access this page.</p>
                <Link to="/dashboard" className="btn-primary">Return to Dashboard</Link>
            </div>
        </div>
    );
};

export default Unauthorized;
