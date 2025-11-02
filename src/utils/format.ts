import type { ComposerTranslation } from 'vue-i18n';

export const formatDuration = (
    minutes: number,
    t: ComposerTranslation | ((key: string) => string)
): string => {
    if (minutes < 60) {
        return `${minutes} ${t('myQuests.duration.min')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours} ${t('myQuests.duration.hr')}`;
    }
    return `${hours} ${t('myQuests.duration.hr')} ${mins} ${t('myQuests.duration.min')}`;
};
