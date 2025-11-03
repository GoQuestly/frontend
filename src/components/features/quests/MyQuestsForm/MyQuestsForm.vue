<template>
  <div class="my-quests-form">
    <div class="page-header">
      <h1>{{ $t('myQuests.title') }}</h1>
      <BaseButton
          variant="primary"
          class="new-quest-button"
      >
        <span class="plus-icon">+</span>
        {{ $t('myQuests.newQuest') }}
      </BaseButton>
    </div>

    <div class="search-wrapper">
      <SearchInput
          v-model="state.searchQuery"
          :placeholder="$t('myQuests.searchPlaceholder')"
          @input="handleSearchDebounced"
      />
    </div>

    <div v-if="state.isLoading" class="loading-state">
      {{ $t('myQuests.loading') }}
    </div>

    <div v-else-if="state.error" class="error-state">
      <p class="error-message">{{ state.error }}</p>
    </div>

    <div v-else-if="state.quests.length === 0" class="empty-state">
      <h2 class="empty-state-title">{{ $t('myQuests.emptyState.title') }}</h2>
      <p class="empty-state-subtitle">{{ $t('myQuests.emptyState.subtitle') }}</p>
    </div>

    <div v-else class="quests-grid">
      <QuestCard
          v-for="quest in state.quests"
          :key="quest.id"
          :quest="quest"
      />
    </div>

    <Pagination
        v-if="state.totalPages > 1 && !state.isLoading"
        :current-page="state.currentPage"
        :total-pages="state.totalPages"
        @page-change="handlePageChange"
    />

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import QuestCard from '@/components/common/QuestCard/QuestCard.vue';
import Pagination from '@/components/common/Pagination/Pagination.vue';
import SearchInput from '@/components/common/SearchInput/SearchInput.vue';
import {
  createInitialMyQuestsState,
  fetchQuestsLogic,
  handleSearchLogic,
  handlePageChangeLogic,
} from './MyQuestsForm.ts';
import './MyQuestsForm.css';

const router = useRouter();
const route = useRoute();
const { t: $t } = useI18n();

const state = reactive(createInitialMyQuestsState());

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const initializeFromUrl = () => {
  const pageFromUrl = parseInt(route.query.page as string) || 1;
  const searchFromUrl = (route.query.search as string) || '';

  state.currentPage = pageFromUrl;
  state.searchQuery = searchFromUrl;
};

const updateUrl = (page: number, search: string) => {
  const query: Record<string, string> = {};

  if (page > 1) {
    query.page = page.toString();
  }

  if (search) {
    query.search = search;
  }

  router.replace({ query });
};

onMounted(async () => {
  initializeFromUrl();
  await fetchQuestsLogic(state, state.currentPage);
});

watch(() => route.query, () => {
  const newPage = parseInt(route.query.page as string) || 1;
  const newSearch = (route.query.search as string) || '';

  if (newPage !== state.currentPage || newSearch !== state.searchQuery) {
    state.currentPage = newPage;
    state.searchQuery = newSearch;
    fetchQuestsLogic(state, newPage);
  }
});

const handleSearchDebounced = async (value: string): Promise<void> => {
  handleSearchLogic(state, value);

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    updateUrl(1, state.searchQuery);
    await fetchQuestsLogic(state, 1);
  }, 500);
};

const handlePageChange = async (page: number): Promise<void> => {
  updateUrl(page, state.searchQuery);
  await handlePageChangeLogic(state, page);
};
</script>