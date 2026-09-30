import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, User } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(credentials);
            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Invalid username or password');
                } else if (err.response.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Authentication failed');
                }
            } else {
                setError('Server unavailable. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '16px', 
                        background: 'var(--primary-navy)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--accent-green)',
                        boxShadow: '0 4px 6px rgba(15, 39, 66, 0.2)'
                    }}>
                        <Shield size={36} />
                    </div>
                </div>
                <h2>Military Asset Management System</h2>
                <p className="subtitle">Sign in to your secure account</p>
                
                {error && <div className="alert error">{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
                    <div className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email</label>
                        <div className="input-with-icon">
                            <User size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                id="usernameOrEmail" 
                                name="usernameOrEmail" 
                                value={credentials.usernameOrEmail} 
                                onChange={handleChange} 
                                required 
                                autoFocus
                                className="form-control"
                                style={{ paddingLeft: '38px' }}
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={credentials.password} 
                                onChange={handleChange} 
                                required 
                                className="form-control"
                                style={{ paddingLeft: '38px' }}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn-primary btn-block" disabled={loading} style={{ marginTop: '24px' }}>
                        {loading ? 'Authenticating...' : 'Secure Sign In'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Request Access</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
