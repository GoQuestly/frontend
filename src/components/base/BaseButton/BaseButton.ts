export interface BaseButtonProps {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

export const baseButtonDefaults: Required<BaseButtonProps> = {
    type: 'button',
    variant: 'primary',
    disabled: false
};