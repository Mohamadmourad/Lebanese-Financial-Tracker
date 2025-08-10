import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                `${process.env.REACT_APP_ENDPOINT_ROUTES}/api/user/login`,
                { email, password },
                { withCredentials: true }
            );

            console.log("Login successful:", res.data);
            navigate('/');
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-title">Login</div>
                {error && <div className="auth-error">{error}</div>}
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
                        autoComplete="username"
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
                        autoComplete="current-password"
                    />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading && <div className="auth-loading"></div>}
                    {loading ? 'Signing In...' : 'Login'}
                </button>
                <Link className="auth-link" to="/signup">Don't have an account? Sign up</Link>
            </form>
        </div>
    );
};

export default Login;