import '../styles/global.css';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

export default function Navbar() {
    const { isAuthenticated, setIsAuthenticated, setSurveyData, setUser, stopRealtimeListener } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        await signOut(auth);
        stopRealtimeListener();
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setUser({});
        setIsAuthenticated(false);
        setSurveyData([]);
        navigate('/');
    };

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
    };

    if (isAuthenticated) {
        return (
            <div className="navbar-container">
                <Logo />
                <div className="login-sign-up">
                    <h2 className="lang-switch" onClick={toggleLanguage}>
                        {i18n.language === 'en' ? 'ES' : 'EN'}
                    </h2>
                    <h2 className="dashboard" onClick={() => navigate('/dashboard')}>{t('nav.dashboard')}</h2>
                    <h2 className="login" onClick={handleLogout}>{t('nav.logout')}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="navbar-container">
            <Logo />
            <div className="login-sign-up">
                <h2 className="lang-switch" onClick={toggleLanguage}>
                    {i18n.language === 'en' ? 'ES' : 'EN'}
                </h2>
                <h2 className="login" onClick={() => navigate('/login')}>{t('nav.login')}</h2>
                <h2 className="sign-up" onClick={() => navigate('/sign-up')}>{t('nav.signup')}</h2>
            </div>
        </div>
    );
}
