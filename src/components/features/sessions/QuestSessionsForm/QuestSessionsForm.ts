import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { questsApi } from '@/api/questsApi';
import { sessionApi } from '@/api/sessionApi';
import { showTemporaryMessage } from '@/utils/messages';
import { MESSAGE_TIMEOUT_MS } from '@/utils/constants';
import type { SessionCardProps } from '@/components/common/SessionCard/SessionCard';
import type {
    CreateQuestSessionRequest,
    QuestSessionResponse,
    QuestSessionsState,
    SessionStatus,
} from '@/types/session';
import { useRouter } from 'vue-router';

export const useQuestSessionsForm = () => {
    const route = useRoute();
    const router = useRouter();
    const questId = Number(route.params.questId);
    const { t: $t } = useI18n();

    const state = reactive<QuestSessionsState>({
        quest: null,
        sessions: [],
        isLoading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
    });

    const isCreateModalOpen = ref(false);
    const createForm = reactive({
        startDate: '',
        isSubmitting: false,
        error: '',
    });
    const editError = ref('');
    const sessionStartTimes = ref<number[]>([]);
    const checkpointsCount = ref(0);

    const getMinStartDate = (): Date => {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 1);
        date.setSeconds(0, 0);
        return date;
    };

    const formatDateTimeLocal = (date: Date): string => {
        const pad = (n: number) => `${n}`.padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const minStartDate = ref(formatDateTimeLocal(getMinStartDate()));

    const formatStart = (dateString: string | null): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const mapStatus = (session: QuestSessionResponse): SessionStatus => {
        if (session.endReason === 'cancelled') return 'cancelled';
        if (session.endDate) return 'completed';
        if (session.isFinished) return 'completed';
        if (session.isActive) return 'in-progress';
        return 'scheduled';
    };

    const translateWithFallback = (key: string, fallback: string): string => {
        const translated = $t(key as never);
        return translated === key ? fallback : translated;
    };

    const mapSession = (data: QuestSessionResponse, maxParticipants?: number): SessionCardProps => {
        const status = mapStatus(data);
        const key = status === 'in-progress' ? 'inProgress' : status;
        const statusLabel = $t(`quests.sessions.status.${key}` as never);

        return {
            id: data.questSessionId.toString(),
            name: data.questTitleShort || data.questTitle || `${$t('quests.sessions.session')} ${data.questSessionId}`,
            status,
            statusLabel,
            start: formatStart(data.startDate),
            participants: maxParticipants
                ? `${data.participantCount} / ${maxParticipants}`
                : `${data.participantCount}`,
        };
    };

    const loadQuestData = async (page: number = state.currentPage): Promise<void> => {
        state.isLoading = true;
        state.error = null;
        state.currentPage = page;
        try {
            const quest = await questsApi.getQuestById(questId);
            state.quest = {
                id: quest.questId,
                title: quest.title,
                description: quest.description,
                maxParticipants: quest.maxParticipantCount,
                maxDurationMinutes: quest.maxDurationMinutes,
            };

            const [sessionsResponse, checkpoints] = await Promise.all([
                sessionApi.getQuestSessions(questId, page, state.pageSize),
                questsApi.getCheckpoints(questId)
            ]);

            checkpointsCount.value = checkpoints.length;

            state.totalPages = Math.max(1, Math.ceil((sessionsResponse.total || 0) / state.pageSize));
            state.sessions = (sessionsResponse.items || []).map((session: QuestSessionResponse) =>
                mapSession(session, quest.maxParticipantCount)
            );
            sessionStartTimes.value = (sessionsResponse.items || [])
                .map((session: QuestSessionResponse) => new Date(session.startDate || '').getTime())
                .filter((time: number) => !Number.isNaN(time));
        } catch (error: any) {
            state.error = $t('quests.sessions.loadFailed');
            state.sessions = [];
            sessionStartTimes.value = [];
            checkpointsCount.value = 0;
        } finally {
            state.isLoading = false;
        }
    };

    const openCreateModal = (): void => {
        if (checkpointsCount.value === 0) {
            showTemporaryMessage(
                editError,
                translateWithFallback(
                    'quests.sessions.noCheckpointsError',
                    'Cannot create session. Please add at least one checkpoint to the quest first.'
                ),
                MESSAGE_TIMEOUT_MS
            );
            return;
        }

        minStartDate.value = formatDateTimeLocal(getMinStartDate());
        createForm.startDate = minStartDate.value;
        createForm.error = '';
        isCreateModalOpen.value = true;
    };

    const closeCreateModal = (): void => {
        createForm.startDate = '';
        createForm.error = '';
        isCreateModalOpen.value = false;
    };

    const clampStartDate = (value: string): string => {
        if (!value) return minStartDate.value;
        createForm.error = '';
        return value;
    };

    const normalizeStartDate = (value: string): string | null => {
        if (!value) return null;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.toISOString();
    };

    const handleCreateSession = async (): Promise<void> => {
        createForm.error = '';
        const startDateIso = normalizeStartDate(createForm.startDate);

        if (!startDateIso) {
            createForm.error = translateWithFallback('quests.sessions.startDateRequired', 'Start date and time is required');
            return;
        }

        const selectedDate = new Date(startDateIso);
        const minAllowedDate = getMinStartDate();

        if (selectedDate < minAllowedDate) {
            createForm.error = translateWithFallback('quests.sessions.startDateTooEarly', 'Start time must be in the future');
            return;
        }

        if (state.quest?.maxDurationMinutes) {
            const newSessionTime = selectedDate.getTime();
            const estimatedDurationMs = state.quest.maxDurationMinutes * 60 * 1000;

            const allSessions = await fetchAllSessionsForQuest(questId);

            const activeSessions = allSessions.filter((session) => {
                return !session.endDate && session.endReason !== 'cancelled';
            });

            const hasConflict = activeSessions.some((session) => {
                if (!session.startDate) return false;
                const existingSessionTime = new Date(session.startDate).getTime();
                const timeDifference = Math.abs(newSessionTime - existingSessionTime);
                return timeDifference < estimatedDurationMs;
            });

            if (hasConflict) {
                const durationInMinutes = state.quest.maxDurationMinutes;
                createForm.error = translateWithFallback(
                    'quests.sessions.minGapError',
                    `Sessions must be at least ${durationInMinutes} minutes apart`
                );
                return;
            }
        }

        createForm.isSubmitting = true;
        const payload: CreateQuestSessionRequest = {
            startDate: startDateIso,
        };

        try {
            await sessionApi.createQuestSession(questId, payload);
            closeCreateModal();
            await loadQuestData(1);
        } catch (error: any) {
            createForm.error = translateWithFallback('quests.sessions.createFailed', 'Failed to create session. Please try again.');
        } finally {
            createForm.isSubmitting = false;
        }
    };

    const fetchAllSessionsForQuest = async (questId: number): Promise<QuestSessionResponse[]> => {
        const pageSize = 100;
        let page = 1;
        let allSessions: QuestSessionResponse[] = [];

        while (true) {
            const response = await sessionApi.getQuestSessions(questId, page, pageSize);
            allSessions = allSessions.concat(response.items || []);

            if (page * pageSize >= response.total) {
                break;
            }
            page++;
        }

        return allSessions;
    };

    const handleEditQuest = (): void => {
        const checkAndNavigate = async () => {
            if (!state.quest?.id) return;
            try {
                const sessions = await fetchAllSessionsForQuest(state.quest.id);
                const hasActiveSession = sessions.some(
                    (session: QuestSessionResponse) => session.isActive
                );
                if (hasActiveSession) {
                    showTemporaryMessage(
                        editError,
                        translateWithFallback(
                            'quests.edit.activeSessionsMessage',
                            'This quest has active sessions and cannot be edited. Please end all active sessions first.'
                        )
                    );
                    return;
                }
                router.push({ name: 'quest-edit', params: { questId: state.quest.id } });
            } catch {
                showTemporaryMessage(
                    editError,
                    translateWithFallback(
                        'quests.sessions.loadFailed',
                        'Unable to check sessions right now. Please try again.'
                    )
                );
            }
        };

        checkAndNavigate();
    };

    const handlePageChange = async (page: number): Promise<void> => {
        await loadQuestData(page);
    };

    const handleManageSession = (sessionId: string): void => {
        if (!state.quest?.id) return;
        router.push({ name: 'quest-session-manage', params: { questId: state.quest.id, sessionId } });
    };

    let minDateUpdateInterval: number | undefined;
    let minDateUpdateTimeout: number | undefined;

    const scheduleMinDateUpdate = () => {
        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        minDateUpdateTimeout = window.setTimeout(() => {
            minStartDate.value = formatDateTimeLocal(getMinStartDate());

            minDateUpdateInterval = window.setInterval(() => {
                minStartDate.value = formatDateTimeLocal(getMinStartDate());
            }, 60000);
        }, msUntilNextMinute);
    };

    onMounted(() => {
        loadQuestData();
        scheduleMinDateUpdate();
    });

    onUnmounted(() => {
        if (minDateUpdateTimeout) {
            clearTimeout(minDateUpdateTimeout);
        }
        if (minDateUpdateInterval) {
            clearInterval(minDateUpdateInterval);
        }
    });

    return {
        state,
        $t,
        isCreateModalOpen,
        createForm,
        openCreateModal,
        closeCreateModal,
        clampStartDate,
        handleCreateSession,
        translateWithFallback,
        minStartDate,
        handlePageChange,
        handleEditQuest,
        handleManageSession,
        editError,
    };
};
