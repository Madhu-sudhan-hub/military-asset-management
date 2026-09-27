import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
                <h2>Sign In to MAMS</h2>
                {error && <div className="alert error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email</label>
                        <input 
                            type="text" 
                            id="usernameOrEmail" 
                            name="usernameOrEmail" 
                            value={credentials.usernameOrEmail} 
                            onChange={handleChange} 
                            required 
                            autoFocus
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary btn-block" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
