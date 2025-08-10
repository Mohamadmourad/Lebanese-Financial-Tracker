import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_ENDPOINT_ROUTES}/api/user/signup`,
                { username, email, password, description },
                { withCredentials: true } 
            );

            console.log("Signup successful:", res.data);
            navigate('/');
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Signup failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-title">Sign Up</div>
                {error && <div className="auth-error">{error}</div>}
                <div>
                    <label className="auth-label" htmlFor="username">Username</label>
                    <input
                        className="auth-input"
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                        autoComplete="username"
                    />
                </div>
                <div>
                    <label className="auth-label" htmlFor="email">Email</label>
                    <input
                        className="auth-input"
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        autoComplete="email"
                    />
                </div>
                <div>
                    <label className="auth-label" htmlFor="password">Password</label>
                    <input
                        className="auth-input"
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        autoComplete="new-password"
                    />
                </div>
                <div>
                    <label className="auth-label" htmlFor="description">
                        Description <span style={{ color: '#78716C', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <textarea
                        className="auth-input"
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Tell us about yourself (optional)"
                        rows={3}
                        style={{ resize: 'vertical', minHeight: '80px' }}
                    />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading && <div className="auth-loading"></div>}
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <Link className="auth-link" to="/login">Already have an account? Login</Link>
            </form>
        </div>
    );
};

export default Signup;