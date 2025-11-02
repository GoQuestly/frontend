export interface HeaderNavButtonProps {
    label: string;
    active?: boolean;
}

export const headerNavButtonDefaults: Partial<HeaderNavButtonProps> = {
    active: false
};

export interface HeaderNavButtonEmits {
    (e: 'click'): void;
}