export interface ProfileButtonProps {
    title?: string;
    userName?: string;
    photoUrl?: string;
}

export const profileButtonDefaults: Partial<ProfileButtonProps> = {
    title: 'profile',
    userName: '',
    photoUrl: undefined,
};

export interface ProfileButtonEmits {
    (e: 'click'): void;
}

const generateHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

export const generateUserColor = (userName: string): string => {
    if (!userName) return '#20b2aa';

    const hash = generateHash(userName);
    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash) % 20);
    const lightness = 45 + (Math.abs(hash >> 8) % 15);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const generateGradient = (userName: string): string => {
    const color1 = generateUserColor(userName);
    const hash = generateHash(userName);

    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 15);
    const lightness = 35 + (Math.abs(hash >> 8) % 15);
    const color2 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};