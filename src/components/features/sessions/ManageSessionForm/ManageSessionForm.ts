import { computed, onBeforeUnmount, onMounted, reactive, ref, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { questsApi } from '@/api/questsApi';
import { sessionApi } from '@/api/sessionApi';
import { useActiveSession } from '@/composables/useActiveSession';
import { useSessionEvents } from '@/composables/useSessionEvents';
import { showTemporaryMessage } from '@/utils/messages';
import type {
    QuestSessionDetail,
    SessionParticipant,
    SessionStatus,
    ParticipantLocation,
    LocationUpdatedEvent,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
    ParticipantPointPassedEvent,
    TaskCompletedEvent,
    ScoresUpdatedEvent,
    SessionCancelledEvent
} from '@/types/session';
import type { CheckpointResponse } from '@/types/checkpoint';

export interface ParticipantOverview {
    id: string;
    name: string;
    location: string;
    score: number;
    progress: number;
    barColor: string;
    latitude?: number;
    longitude?: number;
    lastUpdate?: string;
}

export interface MapMarker {
    id: string;
    label: string;
    color: string;
    top: string;
    left: string;
}

interface QuestCheckpoint {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    order: number;
}

interface ManageSessionState {
    status: SessionStatus;
    startTime: string;
    rawStartDate: string | null;
    participants: {
        current: number;
        max?: number;
    };
    inviteLink: string;
    questTitle: string;
    questDescription?: string;
    startPointName?: string;
    showCheckpoints: boolean;
    liveMode: boolean;
    lastSync: string;
    mapMarkers: MapMarker[];
    participantsOverview: ParticipantOverview[];
    participantLocations: Map<number, ParticipantLocation>;
    isLoading: boolean;
    error: string;
    isActionLoading: boolean;
    actionError: string;
}

const buildInviteLink = (token?: string): string => {
    if (!token) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/join/${token}`;
};

const mapStatus = (data: QuestSessionDetail): SessionStatus => {
    if (data.endReason === 'cancelled') return 'cancelled';
    if (data.endDate) return 'completed';
    if (data.isActive) return 'in-progress';
    return 'scheduled';
};

const formatStart = (value?: string | null): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const mapParticipants = (
    participants: SessionParticipant[] = [],
    defaultLocation: string,
    progress: number,
    nameFallback: string
): ParticipantOverview[] =>
    participants.map((participant, index) => ({
        id: participant.participantId?.toString() ?? participant.userId?.toString() ?? `participant-${index}`,
        name: participant.userName ?? nameFallback,
        location: defaultLocation,
        score: 0,
        progress,
        barColor: progress >= 70 ? '#30b79d' : progress >= 40 ? '#f2b630' : '#d1d5db',
    }));

export const useManageSessionForm = () => {
    const route = useRoute();
    const router = useRouter();
    const { t: $t } = useI18n();
    const questId = Number(route.params.questId);
    const sessionIdParam = route.params.sessionId as string | undefined;
    const sessionId = computed(() => {
        const raw = Number(sessionIdParam);
        return Number.isNaN(raw) ? null : raw;
    });

    const state = reactive<ManageSessionState>({
        status: 'scheduled',
        startTime: '',
        rawStartDate: null,
        participants: {
            current: 0,
            max: undefined,
        },
        inviteLink: '',
        questTitle: '',
        questDescription: '',
        startPointName: '',
        showCheckpoints: true,
        liveMode: true,
        lastSync: '',
        mapMarkers: [
            { id: 'm1', label: 'AJ', color: '#3b82f6', top: '34%', left: '44%' },
            { id: 'm2', label: 'MG', color: '#8b5cf6', top: '52%', left: '58%' },
            { id: 'm3', label: 'CW', color: '#f59e0b', top: '62%', left: '50%' },
            { id: 'm4', label: 'MK', color: '#22c55e', top: '68%', left: '36%' },
        ],
        participantsOverview: [],
        participantLocations: new Map(),
        isLoading: false,
        error: '',
        isActionLoading: false,
        actionError: '',
    });

    const questCheckpoints = ref<QuestCheckpoint[]>([]);
    const actionError = toRef(state, 'actionError');

    const participantLocationsArray = computed(() => {
        return Array.from(state.participantLocations.values());
    });

    const statusLabel = computed(() => {
        const key = state.status === 'in-progress' ? 'inProgress' : state.status;
        return $t(`quests.sessions.status.${key}` as never);
    });

    const sessionTitle = computed(() =>
        state.questTitle ||
        $t('quests.sessions.managePage.titleFallback', { id: sessionId.value ?? '' })
    );

    const copyState = ref<'idle' | 'copied' | 'error'>('idle');
    let copyTimer: number | undefined;

    const copyInviteLink = async (): Promise<void> => {
        if (!state.inviteLink) return;

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(state.inviteLink);
                copyState.value = 'copied';
            } else {
                copyState.value = 'error';
            }
        } catch (error) {
            copyState.value = 'error';
        } finally {
            if (copyTimer) {
                clearTimeout(copyTimer);
            }
            if (copyState.value === 'copied') {
                copyTimer = window.setTimeout(() => {
                    copyState.value = 'idle';
                }, 2200);
            }
        }
    };

    const loadCheckpoints = async (questIdToLoad: number): Promise<void> => {
        try {
            const checkpoints = await questsApi.getCheckpoints(questIdToLoad);
            questCheckpoints.value = checkpoints.map((cp: CheckpointResponse) => ({
                id: cp.questPointId.toString(),
                name: cp.name || `Checkpoint ${cp.orderNum}`,
                latitude: cp.latitude,
                longitude: cp.longitude,
                order: cp.orderNum,
            }));
        } catch (error) {
        }
    };

    const updateFromDetail = (
        detail: QuestSessionDetail,
        maxParticipants?: number,
        questDescription?: string | null,
        questTitle?: string | null
    ) => {
        state.status = mapStatus(detail);
        state.startTime = formatStart(detail.startDate) || '';
        state.rawStartDate = detail.startDate;
        state.participants.current = detail.participantCount ?? 0;
        state.participants.max = maxParticipants ?? undefined;
        state.inviteLink = buildInviteLink(detail.inviteToken ?? undefined);
        state.questTitle = detail.questTitle || questTitle || '';
        state.questDescription = detail.questDescription || questDescription || '';
        state.startPointName = detail.startPointName || '';
        state.lastSync = $t('quests.sessions.managePage.lastSyncJustNow');

        const progress = detail.questPointCount
            ? Math.round((detail.passedQuestPointCount / detail.questPointCount) * 100)
            : 0;
        const defaultLocation = '';

        state.participantsOverview = mapParticipants(
            detail.participants,
            defaultLocation,
            progress,
            $t('quests.sessions.managePage.participants.placeholderName')
        );
    };

    const loadSession = async (): Promise<void> => {
        if (!sessionId.value) {
            state.error = $t('quests.sessions.managePage.errors.noSession');
            return;
        }
        state.isLoading = true;
        state.error = '';
        try {
            const detail = await sessionApi.getSession(sessionId.value);
            const quest = detail.questId ? await questsApi.getQuestById(detail.questId) : null;

            if (detail.questId) {
                await loadCheckpoints(detail.questId);
            }

            updateFromDetail(detail, quest?.maxParticipantCount, quest?.description, quest?.title);
        } catch (error) {
            state.error = $t('quests.sessions.managePage.errors.loadFailed');
        } finally {
            state.isLoading = false;
        }
    };

    const editModal = reactive({
        isOpen: false,
        startDate: '',
        error: '',
        isSubmitting: false,
        minStartDate: '',
    });

    const confirmDialog = reactive({
        isOpen: false,
        isSubmitting: false,
    });

const getMinStartDate = (): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 3);
    date.setSeconds(0, 0);
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTimeLocal = (date: Date): string => {
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const translateWithFallback = (key: string, fallback: string): string => {
    const translated = $t(key as never);
    return translated === key ? fallback : translated;
};

    const handleEditSession = (): void => {
        if (state.status !== 'scheduled') {
            showTemporaryMessage(actionError, $t('quests.sessions.managePage.errors.cannotEdit'));
            return;
        }

        state.actionError = '';
        editModal.startDate = state.rawStartDate ? formatDateTimeLocal(new Date(state.rawStartDate)) : '';
        editModal.error = '';
        editModal.minStartDate = getMinStartDate();
        editModal.isOpen = true;
    };

    const closeEditModal = (): void => {
        editModal.isOpen = false;
        editModal.error = '';
        editModal.startDate = '';
    };

    const handleEditSubmit = async (): Promise<void> => {
        if (!sessionId.value || !editModal.startDate) {
            editModal.error = $t('quests.sessions.startDateRequired');
            return;
        }

        editModal.isSubmitting = true;
        editModal.error = '';

        try {
            const startDateIso = new Date(editModal.startDate).toISOString();
            await sessionApi.updateSession(sessionId.value, { startDate: startDateIso });

            await loadSession();
            closeEditModal();
        } catch (error: any) {
            editModal.error = error.response?.data?.message || $t('quests.sessions.managePage.errors.updateFailed');
        } finally {
            editModal.isSubmitting = false;
        }
    };

    const handleCancelSession = (): void => {
        confirmDialog.isOpen = true;
    };

    const closeConfirmDialog = (): void => {
        confirmDialog.isOpen = false;
    };

    const confirmCancelSession = async (): Promise<void> => {
        if (!sessionId.value) {
            state.actionError = $t('quests.sessions.managePage.errors.noSession');
            confirmDialog.isOpen = false;
            return;
        }
        state.actionError = '';
        confirmDialog.isSubmitting = true;
        try {
            const detail = await sessionApi.cancelSession(sessionId.value);
            const quest = detail.questId ? await questsApi.getQuestById(detail.questId) : null;
            updateFromDetail(detail, quest?.maxParticipantCount, quest?.description, quest?.title);

            if (activeSessionSocket) {
                activeSessionSocket.disconnect();
                activeSessionSocket = null;
            }
            if (sessionEventsSocket) {
                sessionEventsSocket.disconnect();
                sessionEventsSocket = null;
            }
            confirmDialog.isOpen = false;
        } catch (error) {
            state.actionError = $t('quests.sessions.managePage.errors.cancelFailed');
        } finally {
            confirmDialog.isSubmitting = false;
        }
    };

    const handleBack = (): void => {
        if (questId) {
            router.push({ name: 'quest-sessions', params: { questId } });
        } else {
            router.push({ name: 'my-quests' });
        }
    };

    const loadParticipantLocations = async (): Promise<void> => {
        if (!sessionId.value) return;

        try {
            const locations = await sessionApi.getLatestLocations(sessionId.value);

            locations.forEach(location => {
                state.participantLocations.set(location.participantId, location);
            });

            updateParticipantsWithLocations();

            const now = new Date();
            state.lastSync = now.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
        }
    };

    const updateParticipantsWithLocations = (): void => {
        state.participantsOverview.forEach((participant, index) => {
            const location = state.participantLocations.get(Number(participant.id));

            if (location) {
                state.participantsOverview[index].latitude = location.latitude;
                state.participantsOverview[index].longitude = location.longitude;
                state.participantsOverview[index].lastUpdate = location.timestamp;
                state.participantsOverview[index].location =
                    $t('quests.sessions.managePage.location.coordinates', {
                        lat: location.latitude.toFixed(4),
                        lng: location.longitude.toFixed(4)
                    });
            }
        });
    };

    const handleLocationUpdate = (location: LocationUpdatedEvent): void => {
        const participantLocation: ParticipantLocation = {
            participantId: location.participantId,
            userId: location.userId,
            userName: location.userName,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp
        };

        state.participantLocations.set(location.participantId, participantLocation);

        const participantIndex = state.participantsOverview.findIndex(
            p => p.id === location.participantId.toString() || p.id === location.userId.toString()
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].latitude = location.latitude;
            state.participantsOverview[participantIndex].longitude = location.longitude;
            state.participantsOverview[participantIndex].lastUpdate = location.timestamp;
            state.participantsOverview[participantIndex].location =
                $t('quests.sessions.managePage.location.coordinates', {
                    lat: location.latitude.toFixed(4),
                    lng: location.longitude.toFixed(4)
                });
        }

        updateLastSyncTime();
    };

    const handleParticipantJoined = (event: ParticipantJoinedEvent): void => {
        const newParticipant: ParticipantOverview = {
            id: event.participantId.toString(),
            name: event.userName,
            location: $t('quests.sessions.managePage.location.unknown'),
            score: 0,
            progress: 0,
            barColor: '#d1d5db',
        };

        state.participantsOverview.push(newParticipant);
        state.participants.current = state.participantsOverview.length;

        updateLastSyncTime();
    };

    const handleParticipantLeft = (event: ParticipantLeftEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.id === event.participantId.toString() || p.id === event.userId.toString()
        );

        if (participantIndex !== -1) {
            state.participantsOverview.splice(participantIndex, 1);
        }

        state.participantLocations.delete(event.participantId);
        state.participants.current = state.participantsOverview.length;

        updateLastSyncTime();
    };

    const handleParticipantPointPassed = (event: ParticipantPointPassedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.id === event.userId.toString()
        );

        if (participantIndex !== -1) {
            const totalCheckpoints = questCheckpoints.value.length;
            if (totalCheckpoints > 0) {
                const progress = Math.round((event.orderNumber / totalCheckpoints) * 100);
                state.participantsOverview[participantIndex].progress = progress;
                state.participantsOverview[participantIndex].barColor =
                    progress >= 70 ? '#30b79d' : progress >= 40 ? '#f2b630' : '#d1d5db';
            }
        }

        updateLastSyncTime();
    };

    const handleTaskCompleted = (event: TaskCompletedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.id === event.userId.toString()
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].score = event.totalScore;
        }

        updateLastSyncTime();
    };

    const handleScoresUpdated = (event: ScoresUpdatedEvent): void => {
        event.participants.forEach(participantScore => {
            const participantIndex = state.participantsOverview.findIndex(
                p => p.id === participantScore.userId.toString()
            );

            if (participantIndex !== -1) {
                state.participantsOverview[participantIndex].score = participantScore.totalScore;
            }
        });

        updateLastSyncTime();
    };

    const handleSessionCancelledEvent = (_event: SessionCancelledEvent): void => {
        state.status = 'cancelled';
        updateLastSyncTime();
    };

    const updateLastSyncTime = (): void => {
        const now = new Date();
        state.lastSync = now.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleError = (_error: string): void => {
    };

    let activeSessionSocket: ReturnType<typeof useActiveSession> | null = null;
    let sessionEventsSocket: ReturnType<typeof useSessionEvents> | null = null;

    const initWebSockets = (): void => {
        if (!sessionId.value || state.status !== 'in-progress') {
            return;
        }

        activeSessionSocket = useActiveSession(sessionId.value, {
            onLocationUpdated: handleLocationUpdate,
            onParticipantPointPassed: handleParticipantPointPassed,
            onTaskCompleted: handleTaskCompleted,
            onScoresUpdated: handleScoresUpdated,
            onSessionCancelled: handleSessionCancelledEvent,
            onError: handleError,
        });

        sessionEventsSocket = useSessionEvents({
            onParticipantJoined: handleParticipantJoined,
            onParticipantLeft: handleParticipantLeft,
            onSessionCancelled: handleSessionCancelledEvent,
            onError: handleError,
        });

        if (sessionEventsSocket) {
            sessionEventsSocket.subscribeToSession(sessionId.value);
        }
    };

    onMounted(() => {
        loadSession().then(() => {
            if (state.status === 'in-progress') {
                loadParticipantLocations();
                initWebSockets();
            }
        });
    });

    onBeforeUnmount(() => {
        if (copyTimer) {
            clearTimeout(copyTimer);
        }
        if (activeSessionSocket) {
            activeSessionSocket.disconnect();
        }
        if (sessionEventsSocket) {
            sessionEventsSocket.disconnect();
        }
    });

    return {
        state,
        statusLabel,
        sessionTitle,
        copyState,
        copyInviteLink,
        handleBack,
        loadSession,
        questCheckpoints,
        participantLocationsArray,
        handleEditSession,
        handleCancelSession,
        editModal,
        closeEditModal,
        handleEditSubmit,
        confirmDialog,
        closeConfirmDialog,
        confirmCancelSession,
        translateWithFallback,
        actionError,
    };
};
