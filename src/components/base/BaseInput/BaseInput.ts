export interface BaseInputProps {
    type?: string;
    modelValue?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    maxlength?: number;
    numbersOnly?: boolean;
}

export const baseInputDefaults: Required<BaseInputProps> = {
    type: 'text',
    modelValue: '',
    placeholder: '',
    required: false,
    disabled: false,
    maxlength: 524288,
    numbersOnly: false,
};

export interface BaseInputEmits {
    (e: 'update:modelValue', value: string): void;
}

export const handleInputLogic = (
    event: Event,
    numbersOnly: boolean,
    emit: BaseInputEmits
): void => {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    if (numbersOnly) {
        value = value.replace(/[^0-9]/g, '');
    }

    emit('update:modelValue', value);
};

export const handleKeypressLogic = (
    event: KeyboardEvent,
    numbersOnly: boolean
): void => {
    if (numbersOnly) {
        const char = String.fromCharCode(event.keyCode || event.which);
        if (!/[0-9]/.test(char)) {
            event.preventDefault();
        }
    }
};

export const getInputMode = (numbersOnly: boolean): 'numeric' | 'text' => {
    return numbersOnly ? 'numeric' : 'text';
};

export const getPattern = (numbersOnly: boolean): string | undefined => {
    return numbersOnly ? '[0-9]*' : undefined;
};