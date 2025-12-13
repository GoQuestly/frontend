import {computed, onBeforeUnmount, onMounted, reactive, ref, toRef} from 'vue';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {questsApi} from '@/api/questsApi';
import {sessionApi} from '@/api/sessionApi';
import {systemApi} from '@/api/systemApi';
import {useActiveSession} from '@/composables/useActiveSession';
import {useSessionEvents} from '@/composables/useSessionEvents';
import {showTemporaryMessage} from '@/utils/messages';
import {MESSAGE_TIMEOUT_MS} from '@/utils/constants';
import type {
    LocationUpdatedEvent,
    ParticipantDisqualifiedEvent,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
    ParticipantLocation,
    ParticipantPointPassedEvent,
    ParticipantRejectedEvent,
    PhotoModeratedEvent,
    PhotoSubmittedEvent,
    QuestSessionDetail,
    ScoresUpdatedEvent,
    SessionParticipant,
    SessionResultsResponse,
    SessionStatus,
    TaskCompletedEvent,
    UserJoinedEvent,
    UserLeftEvent
} from '@/types/session';
import type {CheckpointResponse} from '@/types/checkpoint';

export interface ParticipantOverview {
    id: string;
    participantId: number | null;
    userId: number | null;
    name: string;
    photoUrl?: string | null;
    score: number;
    progress: number;
    barColor: string;
    latitude?: number;
    longitude?: number;
    lastUpdate?: string;
    rejectionReason?: string | null;
    participationStatus?: string | null;
    isActive: boolean;
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
    rawEndDate: string | null;
    participants: {
        current: number;
        max?: number;
    };
    inviteLink: string;
    questTitle: string;
    questDescription?: string;
    startPointName?: string;
    showCheckpoints: boolean;
    showRoutes: boolean;
    selectedParticipantId: number | null;
    liveMode: boolean;
    lastSync: string;
    sessionTimer: string;
    mapMarkers: MapMarker[];
    participantsOverview: ParticipantOverview[];
    participantLocations: Map<number, ParticipantLocation>;
    sessionResults: SessionResultsResponse | null;
    isLoading: boolean;
    error: string;
    isActionLoading: boolean;
    actionError: string;
}

const buildInviteLink = (token?: string): string => {
    if (!token) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/invite/${token}`;
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
    totalQuestPoints: number,
    nameFallback: string,
    scoresMap?: Map<number, { totalScore: number; completedTasksCount: number }>
): ParticipantOverview[] =>
    participants.map((participant, index) => {
        const passedPoints = participant.passedQuestPointCount ?? 0;
        const progress = totalQuestPoints > 0 ? Math.round((passedPoints / totalQuestPoints) * 100) : 0;
        const scoreData = scoresMap?.get(participant.participantId ?? 0);

        return {
            id: participant.participantId?.toString() ?? participant.userId?.toString() ?? `participant-${index}`,
            participantId: participant.participantId,
            userId: participant.userId,
            name: participant.userName ?? nameFallback,
            photoUrl: participant.photoUrl,
            score: scoreData?.totalScore ?? 0,
            progress,
            barColor: '#30b79d',
            rejectionReason: participant.rejectionReason,
            participationStatus: participant.participationStatus,
            isActive: false,
        };
    });

export const useManageSessionForm = () => {
    const route = useRoute();
    const { t: $t } = useI18n();
    const sessionIdParam = route.params.sessionId as string | undefined;
    const sessionId = computed(() => {
        const raw = Number(sessionIdParam);
        return Number.isNaN(raw) ? null : raw;
    });

    const state = reactive<ManageSessionState>({
        status: 'scheduled',
        startTime: '',
        rawStartDate: null,
        rawEndDate: null,
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
        sessionTimer: '',
        mapMarkers: [
            { id: 'm1', label: 'AJ', color: '#3b82f6', top: '34%', left: '44%' },
            { id: 'm2', label: 'MG', color: '#8b5cf6', top: '52%', left: '58%' },
            { id: 'm3', label: 'CW', color: '#f59e0b', top: '62%', left: '50%' },
            { id: 'm4', label: 'MK', color: '#22c55e', top: '68%', left: '36%' },
        ],
        participantsOverview: [],
        participantLocations: new Map(),
        sessionResults: null,
        showRoutes: false,
        selectedParticipantId: null as number | null,
        isLoading: false,
        error: '',
        isActionLoading: false,
        actionError: '',
    });

    const questCheckpoints = ref<QuestCheckpoint[]>([]);
    const actionError = toRef(state, 'actionError');
    const successMessage = ref('');

    const participantLocationsArray = computed(() => {
        return Array.from(state.participantLocations.values()).filter(location => {
            const participant = state.participantsOverview.find(
                p => p.participantId === location.participantId || p.userId === location.userId
            );
            return participant && participant.participationStatus !== 'rejected' && participant.participationStatus !== 'disqualified';
        });
    });

    const participantRoutes = computed(() => {
        if (!state.sessionResults || !state.sessionResults.rankings || !state.showRoutes) {
            return [];
        }

        const COLORS = [
            '#3b82f6',
            '#8b5cf6',
            '#f59e0b',
            '#22c55e',
            '#ef4444',
            '#ec4899',
            '#06b6d4',
            '#f97316',
        ];

        let rankings = state.sessionResults.rankings.filter(ranking => ranking.route && ranking.route.length > 0);

        if (state.selectedParticipantId !== null) {
            rankings = rankings.filter(ranking => ranking.participantId === state.selectedParticipantId);
        }

        return rankings.map((ranking, index) => ({
            participantId: ranking.participantId,
            userName: ranking.userName,
            photoUrl: ranking.photoUrl,
            route: ranking.route || '',
            color: COLORS[index % COLORS.length],
            rank: ranking.rank,
        }));
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
                }, MESSAGE_TIMEOUT_MS);
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
        questTitle?: string | null,
        scoresMap?: Map<number, { totalScore: number; completedTasksCount: number }>
    ) => {
        state.status = mapStatus(detail);
        state.startTime = formatStart(detail.startDate) || '';
        state.rawStartDate = detail.startDate;
        state.rawEndDate = detail.endDate;
        state.participants.current = detail.participantCount ?? 0;
        state.participants.max = maxParticipants ?? undefined;
        state.inviteLink = buildInviteLink(detail.inviteToken ?? undefined);
        state.questTitle = detail.questTitle || questTitle || '';
        state.questDescription = detail.questDescription || questDescription || '';
        state.startPointName = detail.startPointName || '';
        state.lastSync = $t('quests.sessions.managePage.lastSyncJustNow');

        const totalQuestPoints = detail.questPointCount ?? 0;

        state.participantsOverview = mapParticipants(
            detail.participants,
            totalQuestPoints,
            $t('quests.sessions.managePage.participants.placeholderName'),
            scoresMap
        );
    };

    const loadSessionResults = async (): Promise<void> => {
        if (!sessionId.value) return;

        try {
            state.sessionResults = await sessionApi.getSessionResults(sessionId.value);
        } catch (error) {
            console.error('Failed to load session results:', error);
        }
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

            let scoresMap: Map<number, { totalScore: number; completedTasksCount: number }> | undefined;
            try {
                const scoresData = await sessionApi.getSessionScores(sessionId.value);
                scoresMap = new Map(
                    scoresData.participants.map(p => [p.participantId, { totalScore: p.totalScore, completedTasksCount: p.completedTasksCount }])
                );
            } catch (error) {
                console.error(error)
            }

            updateFromDetail(detail, quest?.maxParticipantCount, quest?.description, quest?.title, scoresMap);

            if (state.status === 'completed' || state.status === 'cancelled') {
                await loadSessionResults();
            }
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

    const photoModerationModal = reactive({
        isOpen: false,
    });

    const pendingPhotosCount = ref(0);

    const openPhotoModeration = (): void => {
        photoModerationModal.isOpen = true;
    };

    const closePhotoModeration = (): void => {
        photoModerationModal.isOpen = false;
    };

    const handlePhotoModerated = (): void => {
        void loadPendingPhotosCount();
    };

    const loadPendingPhotosCount = async (): Promise<void> => {
        if (!sessionId.value) return;
        try {
            const photos = await sessionApi.getPendingPhotos(sessionId.value);
            pendingPhotosCount.value = photos.length;
        } catch (error) {
        }
    };

const getMinStartDate = (): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 1);
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

        const selectedDate = new Date(editModal.startDate);
        const minAllowedDate = new Date();
        minAllowedDate.setMinutes(minAllowedDate.getMinutes() + 1);
        minAllowedDate.setSeconds(0, 0);

        if (selectedDate < minAllowedDate) {
            editModal.error = translateWithFallback('quests.sessions.startDateTooEarly', 'Start time must be in the future');
            return;
        }

        editModal.isSubmitting = true;
        editModal.error = '';

        try {
            const startDateIso = new Date(editModal.startDate).toISOString();
            await sessionApi.updateSession(sessionId.value, { startDate: startDateIso });

            await loadSession();

            if (state.status === 'scheduled') {
                await scheduleStatusCheck();
            }

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

    const loadParticipantLocations = async (): Promise<void> => {
        if (!sessionId.value) return;

        try {
            const locations = await sessionApi.getLatestLocations(sessionId.value);

            locations.forEach(location => {
                if (!location.photoUrl) {
                    const participant = state.participantsOverview.find(
                        p => p.participantId === location.participantId || p.userId === location.userId
                    );

                    if (participant?.photoUrl) {
                        location.photoUrl = participant.photoUrl;
                    }
                }

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
            console.error(error)
        }
    };

    const updateParticipantsWithLocations = (): void => {
        state.participantsOverview.forEach((participant, index) => {
            const location = state.participantLocations.get(Number(participant.id));

            if (location) {
                state.participantsOverview[index].latitude = location.latitude;
                state.participantsOverview[index].longitude = location.longitude;
                state.participantsOverview[index].lastUpdate = location.timestamp;
                state.participantsOverview[index].isActive = location.isActive;
            }
        });
    };

    const handleLocationUpdate = (location: LocationUpdatedEvent): void => {
        const existingLocation = state.participantLocations.get(location.participantId);
        const participant = state.participantsOverview.find(
            p => p.participantId === location.participantId || p.userId === location.userId
        );

        const participantLocation: ParticipantLocation = {
            participantId: location.participantId,
            userId: location.userId,
            userName: location.userName,
            photoUrl: existingLocation?.photoUrl ?? participant?.photoUrl ?? null,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp,
            isActive: true
        };

        state.participantLocations.set(location.participantId, participantLocation);

        const participantIndex = state.participantsOverview.findIndex(
            p => p.participantId === location.participantId || p.userId === location.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].latitude = location.latitude;
            state.participantsOverview[participantIndex].longitude = location.longitude;
            state.participantsOverview[participantIndex].lastUpdate = location.timestamp;
            state.participantsOverview[participantIndex].isActive = true;
        }

        updateLastSyncTime();
    };

    const handleParticipantJoined = async (event: ParticipantJoinedEvent): Promise<void> => {
        const newParticipant: ParticipantOverview = {
            id: event.participantId.toString(),
            participantId: event.participantId,
            userId: event.userId,
            name: event.userName,
            photoUrl: null,
            score: 0,
            progress: 0,
            barColor: '#d1d5db',
            isActive: false,
        };

        state.participantsOverview.push(newParticipant);
        state.participants.current = state.participantsOverview.length;

        try {
            const sessionDetail = await sessionApi.getSession(event.sessionId);

            const fullParticipantData = sessionDetail.participants.find(
                (p: SessionParticipant) => p.participantId === event.participantId
            );

            if (fullParticipantData) {
                const participantIndex = state.participantsOverview.findIndex(
                    p => p.participantId === event.participantId
                );

                if (participantIndex !== -1) {
                    state.participantsOverview[participantIndex].photoUrl = fullParticipantData.photoUrl || null;
                }
            }
        } catch (error) {
            console.error(error)
        }

        updateLastSyncTime();
    };

    const handleParticipantLeft = (event: ParticipantLeftEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.participantId === event.participantId || p.userId === event.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview.splice(participantIndex, 1);
        }

        state.participantLocations.delete(event.participantId);

        state.participants.current = state.participantsOverview.length;

        updateLastSyncTime();
    };

    const handleUserJoined = (event: UserJoinedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.userId === event.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].isActive = true;
        }

        for (const [, location] of state.participantLocations.entries()) {
            if (location.userId === event.userId) {
                location.isActive = true;
                break;
            }
        }

        updateLastSyncTime();
    };

    const handleUserLeft = (event: UserLeftEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.userId === event.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].isActive = false;
        }

        for (const [, location] of state.participantLocations.entries()) {
            if (location.userId === event.userId) {
                location.isActive = false;
                break;
            }
        }

        updateLastSyncTime();
    };

    const handleParticipantPointPassed = (event: ParticipantPointPassedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.userId === event.userId
        );

        if (participantIndex !== -1) {
            const totalCheckpoints = questCheckpoints.value.length;
            if (totalCheckpoints > 0) {
                state.participantsOverview[participantIndex].progress = Math.round((event.orderNumber / totalCheckpoints) * 100);
                state.participantsOverview[participantIndex].barColor = '#30b79d';
            }
        }

        updateLastSyncTime();
    };

    const handleTaskCompleted = (event: TaskCompletedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.userId === event.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].score = event.totalScore;
        }

        updateLastSyncTime();
    };

    const handleScoresUpdated = (event: ScoresUpdatedEvent): void => {
        event.participants.forEach(participantScore => {
            const participantIndex = state.participantsOverview.findIndex(
                p => p.userId === participantScore.userId
            );

            if (participantIndex !== -1) {
                state.participantsOverview[participantIndex].score = participantScore.totalScore;
            }
        });

        updateLastSyncTime();
    };

    const handleSessionCancelledEvent = async (): Promise<void> => {
        state.status = 'cancelled';
        updateLastSyncTime();
        await loadSessionResults();
    };

    const handleSessionEndedEvent = async (): Promise<void> => {
        state.status = 'completed';
        stopTimer();
        updateLastSyncTime();
        await loadSessionResults();
    };

    const handleParticipantRejected = (event: ParticipantRejectedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.participantId === event.participantId || p.userId === event.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].rejectionReason = event.rejectionReason;
            state.participantsOverview[participantIndex].participationStatus = 'rejected';
        }

        updateLastSyncTime();
    };

    const handleParticipantDisqualified = (event: ParticipantDisqualifiedEvent): void => {
        const participantIndex = state.participantsOverview.findIndex(
            p => p.participantId === event.participantId || p.userId === event.userId
        );

        if (participantIndex !== -1) {
            state.participantsOverview[participantIndex].rejectionReason = event.rejectionReason;
            state.participantsOverview[participantIndex].participationStatus = 'disqualified';
        }

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

    const handleError = (error: string): void => {
        console.error("Websocket error", error)
    };

    let activeSessionSocket: ReturnType<typeof useActiveSession> | null = null;
    let sessionEventsSocket: ReturnType<typeof useSessionEvents> | null = null;
    let statusCheckTimeout: number | undefined;
    let timerInterval: number | undefined;
    let serverTimeOffset = 0;

    const formatDuration = (milliseconds: number): string => {
        const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const updateTimer = (): void => {
        if (state.status === 'completed' || state.status === 'cancelled') {
            state.sessionTimer = '';
            return;
        }

        if (!state.rawStartDate) {
            state.sessionTimer = '';
            return;
        }

        const now = getCurrentTime();
        const startDate = new Date(state.rawStartDate);

        if (state.status === 'scheduled') {
            const timeUntilStart = startDate.getTime() - now.getTime();

            if (timeUntilStart > 0) {
                state.sessionTimer = formatDuration(timeUntilStart);
            } else {
                state.sessionTimer = '';
            }
        } else if (state.status === 'in-progress') {
            const duration = now.getTime() - startDate.getTime();

            if (duration >= 0) {
                state.sessionTimer = formatDuration(duration);
            } else {
                state.sessionTimer = '';
            }
        } else {
            state.sessionTimer = '';
        }
    };

    const startTimer = (): void => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        updateTimer();

        if (state.status !== 'completed' && state.status !== 'cancelled') {
            timerInterval = window.setInterval(() => {
                updateTimer();
            }, 1000);
        }
    };

    const stopTimer = (): void => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = undefined;
        }
    };

    const getServerTime = async (): Promise<Date> => {
        try {
            const serverTime = await systemApi.getServerTime();
            const localTime = new Date();
            serverTimeOffset = serverTime.getTime() - localTime.getTime();
            return serverTime;
        } catch (error) {
            return new Date();
        }
    };

    const getCurrentTime = (): Date => {
        return new Date(Date.now() + serverTimeOffset);
    };

    const checkSessionStatus = async (): Promise<void> => {
        if (!sessionId.value) {
            return;
        }

        const previousStatus = state.status;
        await loadSession();

        if (previousStatus === 'scheduled' && state.status === 'in-progress') {
            startTimer();
            await loadParticipantLocations();
            initActiveSessionSocket();
        }
    };

    const scheduleStatusCheck = async (): Promise<void> => {
        if (state.status !== 'scheduled' || !state.rawStartDate) {
            return;
        }

        if (statusCheckTimeout) {
            clearTimeout(statusCheckTimeout);
            statusCheckTimeout = undefined;
        }

        const serverTime = await getServerTime();
        const startDate = new Date(state.rawStartDate);
        const timeUntilStart = startDate.getTime() - serverTime.getTime();

        if (timeUntilStart > 0) {
            statusCheckTimeout = window.setTimeout(() => {
                checkSessionStatus();
            }, timeUntilStart + 1000);
        } else {
            await checkSessionStatus();
        }
    };

    const stopStatusCheck = (): void => {
        if (statusCheckTimeout) {
            clearTimeout(statusCheckTimeout);
            statusCheckTimeout = undefined;
        }
    };

    const initSessionEventsSocket = (): void => {
        if (!sessionId.value) {
            return;
        }

        if (sessionEventsSocket) {
            return;
        }

        sessionEventsSocket = useSessionEvents({
            onParticipantJoined: handleParticipantJoined,
            onParticipantLeft: handleParticipantLeft,
            onSessionCancelled: handleSessionCancelledEvent,
            onSessionEnded: handleSessionEndedEvent,
            onError: handleError,
        });

        if (sessionEventsSocket) {
            sessionEventsSocket.subscribeToSession(sessionId.value);
        }
    };

    const initActiveSessionSocket = (): void => {
        if (!sessionId.value) {
            return;
        }

        if (state.status !== 'in-progress') {
            return;
        }

        if (activeSessionSocket) {
            return;
        }

        activeSessionSocket = useActiveSession(sessionId.value, {
            onUserJoined: handleUserJoined,
            onUserLeft: handleUserLeft,
            onLocationUpdated: handleLocationUpdate,
            onParticipantPointPassed: handleParticipantPointPassed,
            onTaskCompleted: handleTaskCompleted,
            onScoresUpdated: handleScoresUpdated,
            onPhotoSubmitted: handlePhotoSubmitted,
            onPhotoModerated: handlePhotoModeratedEvent,
            onSessionCancelled: handleSessionCancelledEvent,
            onSessionEnded: handleSessionEndedEvent,
            onParticipantRejected: handleParticipantRejected,
            onParticipantDisqualified: handleParticipantDisqualified,
            onError: handleError,
        });
    };

    const handlePhotoSubmitted = (event: PhotoSubmittedEvent): void => {
        void loadPendingPhotosCount();
        showTemporaryMessage(
            successMessage,
            $t('quests.sessions.managePage.events.photoSubmitted', { userName: event.userName }),
            3000
        );
    };

    const handlePhotoModeratedEvent = (_event: PhotoModeratedEvent): void => {
        void loadPendingPhotosCount();
    };

    const selectParticipant = (participantId: number | null): void => {
        if (state.selectedParticipantId === participantId) {
            state.selectedParticipantId = null;
            state.showRoutes = false;
        } else {
            state.selectedParticipantId = participantId;
            state.showRoutes = true;
        }
    };

    onMounted(async () => {
        await getServerTime();

        loadSession().then(() => {
            startTimer();
            initSessionEventsSocket();
            void loadPendingPhotosCount();

            if (state.status === 'in-progress') {
                loadParticipantLocations();
                initActiveSessionSocket();
            } else if (state.status === 'scheduled') {
                scheduleStatusCheck();
            }
        });
    });

    onBeforeUnmount(() => {
        stopStatusCheck();
        stopTimer();
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
        sessionId,
        copyState,
        copyInviteLink,
        loadSession,
        questCheckpoints,
        participantLocationsArray,
        participantRoutes,
        selectParticipant,
        handleEditSession,
        handleCancelSession,
        editModal,
        closeEditModal,
        handleEditSubmit,
        confirmDialog,
        closeConfirmDialog,
        confirmCancelSession,
        photoModerationModal,
        pendingPhotosCount,
        openPhotoModeration,
        closePhotoModeration,
        handlePhotoModerated,
        translateWithFallback,
        actionError,
    };
};
