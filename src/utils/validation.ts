export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email);
};

export const isValidToken = (token: string | null): boolean => {
    return !!token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
};

export const validateCode = (code: string, requiredLength: number): string | null => {
    if (code.length < requiredLength) {
        return 'invalidCode';
    }
    return null;
};

export const validatePasswordLength = (password: string, minLength = 4): string | null => {
    if (password.length < minLength) {
        return 'passwordTooShort';
    }
    return null;
};

export const validatePasswordFields = (
    password: string,
    confirmPassword: string,
    minLength = 4
): string | null => {
    const lengthError = validatePasswordLength(password, minLength);
    if (lengthError) return lengthError;

    if (password !== confirmPassword) {
        return 'passwordMismatch';
    }

    return null;
};

export interface ValidationResult {
    isValid: boolean;
    parsedValue: number;
}

export const validateNumberRange = (
    value: string,
    min: number,
    max?: number
): ValidationResult => {
    const parsed = parseInt(value);
    const isValid = !isNaN(parsed) && parsed >= min && (max === undefined || parsed <= max);
    return { isValid, parsedValue: parsed };
};

export const parseNumber = (value: string, defaultValue: number = 0): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

