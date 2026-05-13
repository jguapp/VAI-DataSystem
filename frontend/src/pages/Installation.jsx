import Logo from '../components/Logo';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

export default function Installation() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
        <Navbar />
        <h2 className='installation-h2'>{t('installation.heading')}</h2>
        <div className="installation-container">
            <div className='installation-1'>
                <img src='/Breathing_Pavilion.jpeg' alt="Breathing Pavilion" className='installation-img' />
                <p>{t('installation.bp')}</p>
                <button className='blue-button' onClick={() => navigate('/survey/breathing-pavilion')}>
                    {t('installation.select')}
                </button>
            </div>
            <div className='installation-2'>
                <img src='/Common_Ground.jpeg' alt="Common Ground" className='installation-img' />
                <p>{t('installation.cg')}</p>
                <button className='blue-button' onClick={() => navigate('/survey/common-ground')}>
                    {t('installation.select')}
                </button>
            </div>
        </div>
        </>
    );
}
