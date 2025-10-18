import { createI18n } from 'vue-i18n';
import en from './en';
import uk from './uk';

const messages = {
    en,
    uk,
};

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'en',
    messages,
});

export default i18n;