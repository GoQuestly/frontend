import { createI18n } from 'vue-i18n';
import en from './en';
import uk from './uk';
import { getLocale } from '@/utils/storage';

const messages = { en, uk };

const savedLocale = getLocale();

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'en',
    messages,
});

export default i18n;
