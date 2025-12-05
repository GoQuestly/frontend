<template>
  <div class="quest-sessions-form">
    <div class="page-header">
      <div>
        <h1 class="quest-sessions-title">{{ state.quest?.title || '' }}</h1>
        <p class="quest-subtitle" v-if="state.quest?.description">{{ state.quest.description }}</p>
      </div>
      <div class="header-actions">
        <BaseButton variant="secondary" class="header-btn" @click="handleEditQuest">
          {{ $t('common.edit') }}
        </BaseButton>
        <BaseButton variant="primary" class="header-btn" @click="openCreateModal">
          + {{ $t('quests.sessions.newSession') }}
        </BaseButton>
      </div>
    </div>
    <ErrorBox v-if="editError" :message="editError" class="quest-sessions__error" />

    <div class="sessions-grid">
      <SessionCard
          v-for="session in state.sessions"
          :key="session.id"
          :session="session"
          @manage="handleManageSession"
      />
      <div v-if="!state.isLoading && state.sessions.length === 0 && !state.error" class="empty-state">
        <p>{{ $t('quests.sessions.empty') }}</p>
      </div>
      <div v-if="state.error" class="error-state">
        <p>{{ state.error }}</p>
      </div>
      <div v-if="state.isLoading" class="loading-state">
        {{ $t('common.loading') }}
      </div>
    </div>
  </div>

  <CreateSessionModal
      :visible="isCreateModalOpen"
      :start-date="createForm.startDate"
      :error="createForm.error"
      :is-submitting="createForm.isSubmitting"
      :translate-with-fallback="translateWithFallback"
      :min-start-date="minStartDate"
      @update:start-date="createForm.startDate = clampStartDate($event)"
      @close="closeCreateModal"
      @submit="handleCreateSession"
  />

  <Pagination
      v-if="state.totalPages > 1 && !state.isLoading"
      :current-page="state.currentPage"
      :total-pages="state.totalPages"
      @page-change="handlePageChange"
      class="sessions-pagination"
  />
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import SessionCard from '@/components/common/SessionCard/SessionCard.vue';
import Pagination from '@/components/common/Pagination/Pagination.vue';
import CreateSessionModal from '@/components/common/CreateSessionModal/CreateSessionModal.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import { useQuestSessionsForm } from './QuestSessionsForm.ts';
import './QuestSessionsForm.css';

const {
  state,
  $t,
  isCreateModalOpen,
  createForm,
  openCreateModal,
  closeCreateModal,
  handleCreateSession,
  translateWithFallback,
  minStartDate,
  handlePageChange,
  handleEditQuest,
  clampStartDate,
  handleManageSession,
  editError,
} = useQuestSessionsForm();
</script>
