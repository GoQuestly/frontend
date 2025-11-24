import { questsApi } from '@/api/questsApi';
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
        id: questResponse.questId.toString(),
        title: questResponse.title,
        subtitle: '',
        description: questResponse.description,
        imageUrl: questResponse.photoUrl || undefined,
        checkpointsCount: 0,
        estimatedDuration: questResponse.maxDurationMinutes,
        lastSessionDate: undefined,
        nextSessionDate: undefined,
    };
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

        state.quests = response.items.map(mapQuestResponseToQuest);
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


