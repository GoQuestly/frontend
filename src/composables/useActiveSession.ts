import { ref, onBeforeUnmount, Ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/utils/storage';
import type {
    ParticipantLocation,
    JoinSessionRequest,
    JoinSessionResponse,
    UpdateLocationRequest,
    UpdateLocationResponse,
    PointPassedEvent,
    ErrorResponse,
    UserJoinedEvent,
    UserLeftEvent,
    LocationUpdatedEvent,
    ParticipantPointPassedEvent,
    TaskCompletedEvent,
    ScoresUpdatedEvent,
    PhotoSubmittedEvent,
    PhotoModeratedEvent,
    ParticipantRejectedEvent,
    SessionCancelledEvent
} from '@/types/session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getWebSocketUrl = (): string => {
    try {
        const url = new URL(API_URL);
        return `${url.protocol}//${url.host}`;
    } catch {
        return API_URL;
    }
};

export interface UseActiveSessionOptions {
    onLocationUpdate?: (location: ParticipantLocation) => void;
    onPointPassed?: (event: PointPassedEvent) => void;
    onUserJoined?: (event: UserJoinedEvent) => void;
    onUserLeft?: (event: UserLeftEvent) => void;
    onLocationUpdated?: (event: LocationUpdatedEvent) => void;
    onParticipantPointPassed?: (event: ParticipantPointPassedEvent) => void;
    onTaskCompleted?: (event: TaskCompletedEvent) => void;
    onScoresUpdated?: (event: ScoresUpdatedEvent) => void;
    onPhotoSubmitted?: (event: PhotoSubmittedEvent) => void;
    onPhotoModerated?: (event: PhotoModeratedEvent) => void;
    onParticipantRejected?: (event: ParticipantRejectedEvent) => void;
    onSessionCancelled?: (event: SessionCancelledEvent) => void;
    onError?: (error: string) => void;
}

export interface UseActiveSessionReturn {
    isConnected: Ref<boolean>;
    isJoined: Ref<boolean>;
    joinSession: (sessionId: number) => void;
    leaveSession: (sessionId: number) => void;
    updateLocation: (latitude: number, longitude: number) => void;
    disconnect: () => void;
}

export const useActiveSession = (
    sessionId: number,
    options: UseActiveSessionOptions = {}
): UseActiveSessionReturn => {
    let socket: Socket | null = null;
    const isConnected = ref(false);
    const isJoined = ref(false);
    const currentSessionId = ref<number | null>(null);

    const {
        onLocationUpdate,
        onPointPassed,
        onUserJoined,
        onUserLeft,
        onLocationUpdated,
        onParticipantPointPassed,
        onTaskCompleted,
        onScoresUpdated,
        onPhotoSubmitted,
        onPhotoModerated,
        onParticipantRejected,
        onSessionCancelled,
        onError
    } = options;

    const connect = () => {
        const token = getAccessToken();

        if (!token) {
            onError?.('No access token found');
            return;
        }

        const wsUrl = getWebSocketUrl();

        socket = io(`${wsUrl}/active-session`, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            isConnected.value = true;

            if (sessionId) {
                joinSession(sessionId);
            }
        });

        socket.on('connect_error', (error) => {
            isConnected.value = false;
            onError?.(`Connection error: ${error.message}`);
        });

        socket.on('disconnect', () => {
            isConnected.value = false;
            isJoined.value = false;
        });

        socket.on('join-session', (response: JoinSessionResponse) => {
            if (response.success) {
                isJoined.value = true;
            } else {
                onError?.(response.message || 'Failed to join session');
            }
        });

        socket.on('join-session-error', (error: ErrorResponse) => {
            isJoined.value = false;
            onError?.(error.error);
        });

        socket.on('update-location', (response: UpdateLocationResponse) => {
            if (response.success && response.location) {
            }
        });

        socket.on('update-location-error', (error: ErrorResponse) => {
            onError?.(error.error);
        });

        socket.on('location-updated', (location: LocationUpdatedEvent) => {
            onLocationUpdated?.(location);
            onLocationUpdate?.(location as unknown as ParticipantLocation);
        });

        socket.on('point-passed', (event: PointPassedEvent) => {
            onPointPassed?.(event);
        });

        socket.on('user-joined', (event: UserJoinedEvent) => {
            onUserJoined?.(event);
        });

        socket.on('user-left', (event: UserLeftEvent) => {
            onUserLeft?.(event);
        });

        socket.on('participant-point-passed', (event: ParticipantPointPassedEvent) => {
            onParticipantPointPassed?.(event);
        });

        socket.on('task-completed', (event: TaskCompletedEvent) => {
            onTaskCompleted?.(event);
        });

        socket.on('scores-updated', (event: ScoresUpdatedEvent) => {
            onScoresUpdated?.(event);
        });

        socket.on('photo-submitted', (event: PhotoSubmittedEvent) => {
            onPhotoSubmitted?.(event);
        });

        socket.on('photo-moderated', (event: PhotoModeratedEvent) => {
            onPhotoModerated?.(event);
        });

        socket.on('participant-rejected', (event: ParticipantRejectedEvent) => {
            onParticipantRejected?.(event);
        });

        socket.on('session-cancelled', (event: SessionCancelledEvent) => {
            onSessionCancelled?.(event);
        });
    };

    const joinSession = (sid: number) => {
        if (!socket || !isConnected.value) {
            return;
        }

        const request: JoinSessionRequest = { sessionId: sid };
        currentSessionId.value = sid;
        socket.emit('join-session', request);
    };

    const leaveSession = (sid: number) => {
        if (!socket || !isConnected.value) {
            return;
        }

        socket.emit('leave-session', { sessionId: sid });
        isJoined.value = false;
        currentSessionId.value = null;
    };

    const updateLocation = (latitude: number, longitude: number) => {
        if (!socket || !isJoined.value || !currentSessionId.value) {
            return;
        }

        const request: UpdateLocationRequest = {
            sessionId: currentSessionId.value,
            latitude,
            longitude
        };

        socket.emit('update-location', request);
    };

    const disconnect = () => {
        if (socket) {
            if (currentSessionId.value) {
                leaveSession(currentSessionId.value);
            }
            socket.close();
            socket = null;
        }
        isConnected.value = false;
        isJoined.value = false;
    };

    connect();

    onBeforeUnmount(() => {
        disconnect();
    });

    return {
        isConnected,
        isJoined,
        joinSession,
        leaveSession,
        updateLocation,
        disconnect,
    };
};
