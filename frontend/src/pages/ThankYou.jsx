import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ThankYou() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
        <Logo />
        <div className="thank-you-container">
            <h1>{t('thankYou.heading')}</h1>
            <p>{t('thankYou.text')}</p>
            <button onClick={() => navigate('/')} className="thank-you-button">
                {t('thankYou.button')}
            </button>
        </div>
        </>
    );
}
