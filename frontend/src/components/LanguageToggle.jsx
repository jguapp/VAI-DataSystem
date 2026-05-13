import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
    };

    return (
        <button className="lang-toggle-fixed" onClick={toggleLanguage}>
            {i18n.language === 'en' ? 'ES' : 'EN'}
        </button>
    );
}
