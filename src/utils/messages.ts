import type { Ref } from 'vue';
export const showTemporaryMessage = (
    messageRef: { value: string },
    message: string,
    duration: number = 5000
): void => {
    messageRef.value = message;
    setTimeout(() => {
        messageRef.value = '';
    }, duration);
};

export const createNotificationHelpers = (
    errorRef: Ref<string>,
    successRef: Ref<string>
) => {
    const showError = (message: string) => {
        showTemporaryMessage(errorRef, message, 5000);
    };

    const showSuccess = (message: string) => {
        showTemporaryMessage(successRef, message, 3000);
    };

    return { showError, showSuccess };
};