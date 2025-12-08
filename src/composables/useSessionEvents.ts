import { ref, onBeforeUnmount, Ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/utils/storage';
import type {
    SubscribeToSessionRequest,
    SubscribeToSessionResponse,
    UnsubscribeFromSessionRequest,
    UnsubscribeFromSessionResponse,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
    SessionCancelledEvent,
    ErrorResponse
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

export interface UseSessionEventsOptions {
    onParticipantJoined?: (event: ParticipantJoinedEvent) => void;
    onParticipantLeft?: (event: ParticipantLeftEvent) => void;
    onSessionCancelled?: (event: SessionCancelledEvent) => void;
    onError?: (error: string) => void;
}

export interface UseSessionEventsReturn {
    isConnected: Ref<boolean>;
    isSubscribed: Ref<boolean>;
    subscribeToSession: (sessionId: number) => void;
    unsubscribeFromSession: (sessionId: number) => void;
    disconnect: () => void;
}

export const useSessionEvents = (
    options: UseSessionEventsOptions = {}
): UseSessionEventsReturn => {
    let socket: Socket | null = null;
    const isConnected = ref(false);
    const isSubscribed = ref(false);
    const currentSessionId = ref<number | null>(null);

    const { onParticipantJoined, onParticipantLeft, onSessionCancelled, onError } = options;

    const connect = () => {
        const token = getAccessToken();

        if (!token) {
            console.error('[useSessionEvents] No access token found');
            onError?.('No access token found');
            return;
        }

        const wsUrl = getWebSocketUrl();

        socket = io(`${wsUrl}/session-events`, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            isConnected.value = true;

            if (currentSessionId.value) {
                subscribeToSession(currentSessionId.value);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('[useSessionEvents] Connection error:', error.message);
            isConnected.value = false;
            onError?.(`Connection error: ${error.message}`);
        });

        socket.on('disconnect', () => {
            isConnected.value = false;
            isSubscribed.value = false;
        });

        socket.on('error', (error: ErrorResponse) => {
            console.error('[useSessionEvents] Socket error:', error.error);
            onError?.(error.error);
        });

        socket.on('subscribe-to-session', (response: SubscribeToSessionResponse) => {
            if (response.success) {
                isSubscribed.value = true;
            } else {
                console.error('[useSessionEvents] Failed to subscribe:', response.message);
                onError?.(response.message || 'Failed to subscribe to session');
                isSubscribed.value = false;
            }
        });

        socket.on('subscribe-error', (error: ErrorResponse) => {
            console.error('[useSessionEvents] Subscribe error:', error.error);
            isSubscribed.value = false;
            onError?.(error.error);
        });

        socket.on('unsubscribe-from-session', (response: UnsubscribeFromSessionResponse) => {
            if (response.success) {
                isSubscribed.value = false;
            } else {
                console.error('[useSessionEvents] Failed to unsubscribe:', response.message);
                onError?.(response.message || 'Failed to unsubscribe from session');
            }
        });

        socket.on('unsubscribe-error', (error: ErrorResponse) => {
            console.error('[useSessionEvents] Unsubscribe error:', error.error);
            onError?.(error.error);
        });

        socket.on('participant-joined', (event: ParticipantJoinedEvent) => {
            onParticipantJoined?.(event);
        });

        socket.on('participant-left', (event: ParticipantLeftEvent) => {
            onParticipantLeft?.(event);
        });

        socket.on('session-cancelled', (event: SessionCancelledEvent) => {
            onSessionCancelled?.(event);
        });
    };

    const subscribeToSession = (sessionId: number) => {
        currentSessionId.value = sessionId;

        if (!socket) {
            console.error('[useSessionEvents] Socket does not exist');
            return;
        }

        if (!isConnected.value) {
            return;
        }

        const request: SubscribeToSessionRequest = { sessionId };
        socket.emit('subscribe-to-session', request);
    };

    const unsubscribeFromSession = (sessionId: number) => {

        if (!socket || !isConnected.value) {
            return;
        }

        const request: UnsubscribeFromSessionRequest = { sessionId };
        socket.emit('unsubscribe-from-session', request);
        currentSessionId.value = null;
    };

    const disconnect = () => {
        if (socket) {
            if (currentSessionId.value) {
                unsubscribeFromSession(currentSessionId.value);
            }
            socket.close();
            socket = null;
        }
        isConnected.value = false;
        isSubscribed.value = false;
    };

    connect();

    onBeforeUnmount(() => {
        disconnect();
    });

    return {
        isConnected,
        isSubscribed,
        subscribeToSession,
        unsubscribeFromSession,
        disconnect,
    };
};
