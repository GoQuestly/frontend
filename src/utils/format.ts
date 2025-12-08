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

export const getPluralFormIndex = (count: number): number => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 2;
    }

    if (lastDigit === 1) {
        return 0;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 1;
    }

    return 2;
};

export const formatCheckpoints = (
    count: number,
    t: ComposerTranslation | ((key: string) => string)
): string => {
    const forms = [
        t('quests.myQuests.checkpointsOne'),
        t('quests.myQuests.checkpointsFew'),
        t('quests.myQuests.checkpointsMany'),
    ];
    const formIndex = getPluralFormIndex(count);
    return `${count} ${forms[formIndex]}`;
};

