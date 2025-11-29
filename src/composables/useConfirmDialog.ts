import { inject, provide } from 'vue';

export type ConfirmTone = 'default' | 'danger';

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    workingText?: string;
    tone?: ConfirmTone;
};

export type ConfirmHandler = (options: ConfirmOptions) => Promise<boolean>;

const confirmDialogKey = Symbol('confirmDialog');

export const provideConfirmDialog = (handler: ConfirmHandler): void => {
    provide(confirmDialogKey, handler);
};

export const useConfirmDialog = (): ConfirmHandler => {
    const handler = inject<ConfirmHandler | null>(confirmDialogKey, null);

    if (handler) {
        return handler;
    }

    return async (options: ConfirmOptions): Promise<boolean> => {
        if (typeof window === 'undefined') return true;
        return window.confirm(options.message);
    };
};
