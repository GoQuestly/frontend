import type { ComposerTranslation } from 'vue-i18n';

type Translator = ComposerTranslation;

export const confirmWithTranslation = (t: Translator, key: string): boolean => {
    if (typeof window === 'undefined') {
        return true;
    }

    const message = t(key);
    return window.confirm(message);
};