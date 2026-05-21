import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoMdLock, IoMdPerson } from 'react-icons/io';
import { useAuth } from '../contexts/auth/authContext';
import { useToast } from '../contexts/toast/toastContext';
import useDocTitle from '../hooks/useDocTitle';

const Login = () => {
    useDocTitle('Login');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const toast = useToast();

    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const me = await login(form.username, form.password);
            toast.success(`Welcome back, ${me.username}!`);
            const next = location.state?.from || '/';
            navigate(next);
        } catch (err) {
            setError(err.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth_page">
            <div className="auth_card">
                <div className="auth_brand">FADEAWAY</div>
                <h1 className="auth_title">Welcome back</h1>
                <p className="auth_subtitle">Sign in to track your orders and continue shopping</p>

                <form onSubmit={onSubmit} className="auth_form">
                    <div className="auth_input">
                        <IoMdPerson className="auth_icon" />
                        <input
                            name="username"
                            type="text"
                            placeholder="Username"
                            autoComplete="username"
                            value={form.username}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="auth_input">
                        <IoMdLock className="auth_icon" />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={form.password}
                            onChange={onChange}
                            required
                        />
                    </div>

                    {error && <div className="auth_error">{error}</div>}

                    <button type="submit" className="auth_submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div className="auth_divider">New to FADEAWAY?</div>
                <p className="auth_footer">
                    Don't have an account?
                    <Link to="/register">Create one</Link>
                </p>
            </div>
        </section>
    );
};

export default Login;
