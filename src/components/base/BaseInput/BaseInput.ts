export interface BaseInputProps {
    type?: string;
    modelValue?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    maxlength?: number;
    numbersOnly?: boolean;
    min?: number | string;
    max?: number | string;
}

export const baseInputDefaults: BaseInputProps = {
    type: 'text',
    modelValue: '',
    placeholder: '',
    required: false,
    disabled: false,
    maxlength: 524288,
    numbersOnly: false,
    min: undefined,
    max: undefined
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
        target.value = value;
    }

    emit('update:modelValue', value);
};

export const handleBlurLogic = (
    value: string,
    emit: BaseInputEmits,
    min?: number | string,
    max?: number | string
): void => {
    if (value === '') {
        emit('update:modelValue', '');
        return;
    }

    let numericValue = parseInt(value, 10);

    if (isNaN(numericValue)) {
        emit('update:modelValue', '');
        return;
    }

    if (typeof min === 'number' && numericValue < min) {
        numericValue = min;
    }

    if (typeof max === 'number' && numericValue > max) {
        numericValue = max;
    }

    emit('update:modelValue', String(numericValue));
};

export const handleKeydownLogic = (
    event: KeyboardEvent,
    numbersOnly: boolean
): void => {
    if (!numbersOnly) return;

    const allowedKeys = [
        'Backspace', 'Delete',
        'ArrowLeft', 'ArrowRight',
        'Tab', 'Home', 'End'
    ];

    if (
        allowedKeys.includes(event.key) ||
        event.ctrlKey ||
        event.metaKey
    ) {
        return;
    }

    if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
    }
};

export const getInputMode = (numbersOnly: boolean): 'numeric' | 'text' =>
    numbersOnly ? 'numeric' : 'text';

export const getPattern = (numbersOnly: boolean): string | undefined =>
    numbersOnly ? '[0-9]*' : undefined;
