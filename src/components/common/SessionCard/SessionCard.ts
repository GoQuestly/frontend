export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface SessionCardProps {
    id: string;
    name: string;
    status: SessionStatus;
    statusLabel?: string;
    start: string;
    participants: string;
}
