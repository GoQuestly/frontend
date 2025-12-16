import { ref, watch, onMounted } from 'vue';
import { adminApi, type PlatformStatistics } from '@/api/adminApi';

type Period = 'day' | 'week' | 'month' | 'all-time';

export const useStatistics = () => {
  const selectedPeriod = ref<Period>('month');
  const isLoading = ref(false);
  const statistics = ref<PlatformStatistics | null>(null);

  const loadStatistics = async () => {
    isLoading.value = true;
    try {
      const data = await adminApi.getStatistics(selectedPeriod.value);
      statistics.value = data;
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadStatistics();
  });

  watch(selectedPeriod, () => {
    loadStatistics();
  });

  const formatPeriod = (period: { type: string; startDate: string; endDate: string }): string => {
    const start = new Date(period.startDate).toLocaleDateString();
    const end = new Date(period.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  return {
    selectedPeriod,
    isLoading,
    statistics,
    formatPeriod,
  };
};
