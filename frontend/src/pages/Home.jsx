import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
        <Navbar />
        <div className="home-container">
            <h1>{t('home.title')}</h1>
            <p className='home-text'>{t('home.description')}</p>
            <button className='blue-button' onClick={() => navigate('/installation-selection')}>
                {t('home.button')}
            </button>
            <footer className="home-footer">
                <a href="https://www.vanalen.org/" target="_blank" rel="noopener noreferrer">
                    {t('home.footerLink')}
                </a>
            </footer>
        </div>
        </>
    );
}
