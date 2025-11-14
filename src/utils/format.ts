import type { ComposerTranslation } from 'vue-i18n';

export const formatDuration = (
    minutes: number,
    t: ComposerTranslation | ((key: string) => string)
): string => {
    if (minutes < 60) {
        return `${minutes} ${t('common.min')}`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const hourKey = 'common.hr';
    const minKey = 'common.min';

    if (mins === 0) {
        return `${hours} ${t(hourKey)}`;
    }

    return `${hours} ${t(hourKey)} ${mins} ${t(minKey)}`;
};
