import { ref, onBeforeUnmount, watch, Ref } from 'vue';
import { useActiveSession } from './useActiveSession';

export interface UseParticipantLocationTrackingOptions {
    sessionId: number;
    enabled?: Ref<boolean> | boolean;
    updateInterval?: number;
    onLocationSent?: (latitude: number, longitude: number) => void;
    onError?: (error: string) => void;
}

export interface UseParticipantLocationTrackingReturn {
    isTracking: Ref<boolean>;
    lastLocation: Ref<{ latitude: number; longitude: number; timestamp: Date } | null>;
    error: Ref<string | null>;
    startTracking: () => void;
    stopTracking: () => void;
}

export const useParticipantLocationTracking = (
    options: UseParticipantLocationTrackingOptions
): UseParticipantLocationTrackingReturn => {
    const {
        sessionId,
        enabled = true,
        updateInterval = 5000,
        onLocationSent,
        onError
    } = options;

    const isTracking = ref(false);
    const lastLocation = ref<{ latitude: number; longitude: number; timestamp: Date } | null>(null);
    const error = ref<string | null>(null);
    let intervalId: number | undefined;

    const { isConnected, isJoined, updateLocation } = useActiveSession(sessionId, {
        onError: (err) => {
            error.value = err;
            onError?.(err);
        }
    });

    const sendLocation = () => {
        if (!isConnected.value || !isJoined.value) {
            return;
        }

        if (!navigator.geolocation) {
            const err = 'Geolocation is not supported by this browser';
            error.value = err;
            onError?.(err);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                updateLocation(latitude, longitude);

                lastLocation.value = {
                    latitude,
                    longitude,
                    timestamp: new Date()
                };

                error.value = null;
                onLocationSent?.(latitude, longitude);
            },
            (err) => {
                const errorMsg = `Geolocation error: ${err.message}`;
                error.value = errorMsg;
                onError?.(errorMsg);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const startTracking = () => {
        if (isTracking.value) return;

        sendLocation();

        intervalId = window.setInterval(() => {
            sendLocation();
        }, updateInterval);

        isTracking.value = true;
    };

    const stopTracking = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
        isTracking.value = false;
    };

    watch(
        () => typeof enabled === 'boolean' ? enabled : enabled.value,
        (isEnabled) => {
            if (isEnabled && isJoined.value) {
                startTracking();
            } else {
                stopTracking();
            }
        },
        { immediate: false }
    );

    watch(isJoined, (joined) => {
        const isEnabled = typeof enabled === 'boolean' ? enabled : enabled.value;
        if (joined && isEnabled) {
            startTracking();
        } else if (!joined) {
            stopTracking();
        }
    });

    onBeforeUnmount(() => {
        stopTracking();
    });

    return {
        isTracking,
        lastLocation,
        error,
        startTracking,
        stopTracking,
    };
};
