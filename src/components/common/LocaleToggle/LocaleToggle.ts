import { setLocale } from '@/utils/storage';

export type Locale = 'en' | 'uk';

export const toggleLocaleLogic = (currentLocale: string): Locale => {
    const newLocale: Locale = currentLocale === 'en' ? 'uk' : 'en';
    setLocale(newLocale);
    return newLocale;
};

export const getAriaLabel = (currentLocale: string): string => {
    return currentLocale === 'en' ? 'Switch to Ukrainian' : 'Switch to English';
};
