export interface SearchInputProps {
    modelValue: string;
    placeholder?: string;
}

export const searchInputDefaults: Partial<SearchInputProps> = {
    placeholder: 'Search...'
};

export interface SearchInputEmits {
    (e: 'update:modelValue', value: string): void;
    (e: 'input', value: string): void;
}

export const handleInputChange = (
    event: Event,
    emit: SearchInputEmits
): void => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
    emit('input', target.value);
};