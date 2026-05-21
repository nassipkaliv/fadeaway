import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdLock, IoMdMail, IoMdPerson } from 'react-icons/io';
import { useAuth } from '../contexts/auth/authContext';
import { useToast } from '../contexts/toast/toastContext';
import useDocTitle from '../hooks/useDocTitle';

const formatErrors = (data) => {
    if (!data) return 'Registration failed';
    if (typeof data === 'string') return data;
    return Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' • ');
};

const Register = () => {
    useDocTitle('Create account');
    const navigate = useNavigate();
    const { register } = useAuth();
    const toast = useToast();

    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const me = await register(form);
            toast.success(`Welcome to FADEAWAY, ${me.username}!`);
            navigate('/');
        } catch (err) {
            setError(formatErrors(err.data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth_page">
            <div className="auth_card">
                <div className="auth_brand">FADEAWAY</div>
                <h1 className="auth_title">Create account</h1>
                <p className="auth_subtitle">Join the club. Track orders, faster checkout.</p>

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
                            minLength={3}
                        />
                    </div>
                    <div className="auth_input">
                        <IoMdMail className="auth_icon" />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            value={form.email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="auth_input">
                        <IoMdLock className="auth_icon" />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password (8+ characters)"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={onChange}
                            required
                            minLength={8}
                        />
                    </div>

                    {error && <div className="auth_error">{error}</div>}

                    <button type="submit" className="auth_submit" disabled={loading}>
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <div className="auth_divider">Already with us?</div>
                <p className="auth_footer">
                    Have an account?
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </section>
    );
};

export default Register;
