import { questsApi } from '@/api/questsApi';
import { sessionApi } from '@/api/sessionApi';
import { type QuestResponse, Quest, MyQuestsState } from '@/types/quests';
import { formatDuration } from '@/utils/format';


export const createInitialMyQuestsState = (): MyQuestsState => ({
    quests: [],
    searchQuery: '',
    currentPage: 1,
    totalPages: 1,
    pageSize: 3,
    isLoading: false,
    error: null,
});

const mapQuestResponseToQuest = (questResponse: QuestResponse): Quest => {
    return {
        id: questResponse.questId,
        title: questResponse.title,
        subtitle: '',
        description: questResponse.description,
        imageUrl: questResponse.photoUrl || undefined,
        checkpointsCount: questResponse.questPointCount || 0,
        estimatedDuration: questResponse.maxDurationMinutes,
        lastSessionDate: questResponse.lastSessionDate,
        nextSessionDate: questResponse.nextSessionDate,
    };
};

const formatSessionDate = (dateString: string | null): string | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const fetchQuestAdditionalData = async (questId: number): Promise<{ lastSessionDate?: string; nextSessionDate?: string; checkpointsCount: number }> => {
    try {
        const [sessionsResponse, checkpoints] = await Promise.all([
            sessionApi.getQuestSessions(questId, 1, 100),
            questsApi.getCheckpoints(questId)
        ]);

        const sessions = sessionsResponse.items || [];
        const checkpointsCount = checkpoints.length;

        if (sessions.length === 0) {
            return { checkpointsCount };
        }

        const now = new Date().getTime();
        const pastSessions = sessions
            .filter(s => s.startDate && new Date(s.startDate).getTime() < now)
            .sort((a, b) => new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime());

        const futureSessions = sessions
            .filter(s => s.startDate && new Date(s.startDate).getTime() >= now)
            .sort((a, b) => new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime());

        return {
            lastSessionDate: pastSessions[0]?.startDate ? formatSessionDate(pastSessions[0].startDate) : undefined,
            nextSessionDate: futureSessions[0]?.startDate ? formatSessionDate(futureSessions[0].startDate) : undefined,
            checkpointsCount,
        };
    } catch (error) {
        return { checkpointsCount: 0 };
    }
};

export const fetchQuestsLogic = async (
    state: MyQuestsState,
    page: number = 1
): Promise<void> => {
    state.isLoading = true;
    state.error = null;

    try {
        const response = await questsApi.getQuests({
            search: state.searchQuery,
            pageNumber: page,
            pageSize: state.pageSize,
        });

        const quests = response.items.map(mapQuestResponseToQuest);

        const questsWithSessions = await Promise.all(
            quests.map(async (quest) => {
                const additionalData = await fetchQuestAdditionalData(quest.id);
                return {
                    ...quest,
                    lastSessionDate: additionalData.lastSessionDate,
                    nextSessionDate: additionalData.nextSessionDate,
                    checkpointsCount: additionalData.checkpointsCount,
                };
            })
        );

        state.quests = questsWithSessions;
        state.currentPage = response.pageNumber;
        state.totalPages = Math.ceil(response.total / response.pageSize);
    } catch (error) {
        state.error = 'Failed to load quests';
        state.quests = [];
        state.totalPages = 1;
    } finally {
        state.isLoading = false;
    }
};

export const handleSearchLogic = (
    state: MyQuestsState,
    searchQuery: string
): void => {
    state.searchQuery = searchQuery;
    state.currentPage = 1;
};

export const handlePageChangeLogic = async (
    state: MyQuestsState,
    page: number
): Promise<void> => {
    if (page < 1 || page > state.totalPages) return;
    await fetchQuestsLogic(state, page);
};

export { formatDuration };


