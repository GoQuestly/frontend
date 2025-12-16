import { ref, computed, watch, onMounted } from 'vue';
import { adminApi, type AdminUser } from '@/api/adminApi';

type SortField = 'id' | 'name';
type SortDirection = 'asc' | 'desc';

export const useUsersManagement = () => {

  const searchQuery = ref('');
  const sortBy = ref<SortField>('id');
  const sortDirection = ref<SortDirection>('desc');
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalUsers = ref(0);
  const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value));
  const isLoading = ref(false);

  const users = ref<AdminUser[]>([]);

  const loadUsers = async () => {
    isLoading.value = true;
    try {
      const response = await adminApi.getUsers({
        pageNumber: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value.trim() || undefined,
        sortBy: sortBy.value === 'id' ? 'registration' : sortBy.value,
        sortOrder: sortDirection.value.toUpperCase() as 'ASC' | 'DESC',
      });

      users.value = response.items;
      totalUsers.value = response.total;
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadUsers();
  });

  watch([searchQuery, sortBy, sortDirection, currentPage], () => {
    loadUsers();
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  const handleSort = (field: SortField) => {
    if (sortBy.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = field;
      sortDirection.value = 'asc';
    }
  };

  const getSortIcon = (field: SortField): string => {
    if (sortBy.value !== field) return '↕';
    return sortDirection.value === 'asc' ? '↑' : '↓';
  };

  const toggleBan = async (userId: number, currentBanStatus: boolean) => {
    try {
      if (currentBanStatus) {
        await adminApi.unbanUser(userId);
      } else {
        await adminApi.banUser(userId);
      }
      const user = users.value.find(u => u.userId === userId);
      if (user) {
        user.isBanned = !currentBanStatus;
      }
    } catch (error) {
      console.error('Failed to ban/unban user:', error);
    }
  };

  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };

  return {
    searchQuery,
    sortBy,
    sortDirection,
    currentPage,
    totalPages,
    isLoading,
    users,
    handleSort,
    getSortIcon,
    toggleBan,
    handlePageChange,
  };
};
