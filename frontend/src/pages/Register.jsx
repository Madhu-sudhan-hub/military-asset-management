import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
                <h2>Create MAMS Account</h2>
                <p className="subtitle">Accounts will be created as Logistics Officer by default.</p>
                {error && <div className="alert error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password (min 8 characters)</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength="8" />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="baseId">Base ID (Optional)</label>
                        <input type="number" id="baseId" name="baseId" value={formData.baseId} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="personnelId">Personnel ID (Optional)</label>
                        <input type="number" id="personnelId" name="personnelId" value={formData.personnelId} onChange={handleChange} />
                    </div>
                    
                    <button type="submit" className="btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
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
