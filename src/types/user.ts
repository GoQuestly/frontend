export interface User {
    id: number;
    email: string;
    name: string;
    is_verified: boolean;
    photo_url?: string;
}