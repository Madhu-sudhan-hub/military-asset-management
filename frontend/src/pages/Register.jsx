import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, User, Mail, Lock, Building, UserCircle } from 'lucide-react';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        personnelId: '',
        baseId: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;
        
        setLoading(true);

        try {
            // Note: role is not sent to prevent privilege escalation.
            // Backend will default to LOGISTICS_OFFICER.
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                personnelId: formData.personnelId ? parseInt(formData.personnelId) : null,
                baseId: formData.baseId ? parseInt(formData.baseId) : null
            };
            
            await register(payload);
            // Registration successful, navigate to login
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error === 'VALIDATION_ERROR') {
                setError('Please check your inputs: ' + err.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
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
                <h2>Create Account</h2>
                <p className="subtitle">Accounts will be created as Logistics Officer by default.</p>
                
                {error && <div className="alert error">{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-with-icon">
                            <User size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                required 
                                className="form-control"
                                style={{ paddingLeft: '38px' }}
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                className="form-control"
                                style={{ paddingLeft: '38px' }}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>
                    
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    minLength="8"
                                    className="form-control"
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Min 8 chars"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-control"
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label htmlFor="baseId">Base ID (Optional)</label>
                            <div className="input-with-icon">
                                <Building size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                                <input 
                                    type="number" 
                                    id="baseId" 
                                    name="baseId" 
                                    value={formData.baseId} 
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Base ID"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="personnelId">Personnel ID (Optional)</label>
                            <div className="input-with-icon">
                                <UserCircle size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                                <input 
                                    type="number" 
                                    id="personnelId" 
                                    name="personnelId" 
                                    value={formData.personnelId} 
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Personnel ID"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" className="btn-primary btn-block" disabled={loading} style={{ marginTop: '24px' }}>
                        {loading ? 'Processing Request...' : 'Request Access'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
