import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/auth.css';
import API from '../utils/apiClient';

export default function Signup() {
    const [userInfo, setUserInfo] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const { email, firstName, lastName, password, confirmPassword } = userInfo;

        if (!email.endsWith('@vanalen.org')) {
            setError('Only @vanalen.org email addresses are allowed to register.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!passwordPattern.test(password)) {
            setError('Password must be at least 8 characters and include one number and one special character.');
            return;
        }

        try {
            await API.post('/register-user', { email, firstName, lastName, password });
            setError('');
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <>
        <Logo />
        <div className="auth-container">
            <h2>Sign Up</h2>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                For Van Alen Institute staff only.<br />You must use your <strong>@vanalen.org</strong> email.
            </p>
            <form onSubmit={handleSignup} className="auth-form">
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={userInfo.firstName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={userInfo.lastName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email (@vanalen.org)"
                    value={userInfo.email}
                    onChange={handleChange}
                    required
                />
                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={userInfo.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="show-password-btn"
                        onClick={() => setShowPassword(prev => !prev)}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <div className="password-wrapper">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={userInfo.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="show-password-btn"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                    >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <button type="submit" className="auth-button">Sign Up</button>
            </form>
            <p>
                Already have an account? <a href="/login">Log in</a>
            </p>
        </div>
        <footer className="login-signup-footer">Only Van Alen Institute Staff Can Create An Account</footer>
        </>
    );
}
