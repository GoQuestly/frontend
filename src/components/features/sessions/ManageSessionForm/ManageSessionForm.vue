<template>
  <div class="manage-session">
    <div v-if="state.isLoading" class="manage-session__loading">
      {{ $t('common.loading') }}
    </div>
    <div v-else-if="state.error" class="manage-session__error">
      {{ state.error }}
    </div>
    <div v-else class="manage-session__body">
    <header class="manage-session__header">
      <div class="manage-session__title-block">
        <h1 class="manage-session__title">{{ sessionTitle }}</h1>
      </div>
      <div class="manage-session__actions">
        <BaseButton
          variant="secondary"
          class="action-btn action-btn--edit"
          @click="handleEditSession"
        >
          {{ $t('common.edit') }}
        </BaseButton>
        <BaseButton
          v-if="state.status === 'in-progress'"
          variant="primary"
          class="action-btn action-btn--photos"
          :class="{ 'has-pending': pendingPhotosCount > 0 }"
          @click="openPhotoModeration"
        >
          {{ $t('quests.sessions.managePage.photoModeration.title') }}
          <span v-if="pendingPhotosCount > 0" class="badge">{{ pendingPhotosCount }}</span>
        </BaseButton>
        <BaseButton
          variant="secondary"
          class="action-btn action-btn--cancel"
          :disabled="state.isActionLoading || state.status === 'cancelled'"
          @click="handleCancelSession"
        >
          {{ state.isActionLoading ? $t('common.loading') : $t('quests.sessions.managePage.actions.cancel') }}
        </BaseButton>
      </div>
      <ErrorBox v-if="actionError" :message="actionError" class="manage-session__action-error" />
    </header>

    <section class="manage-session__content">
      <div class="map-card">
        <div class="card-header">
          <div>
            <p class="card-title">{{ $t('quests.sessions.managePage.map.title') }}</p>
            <p class="card-subtitle">{{ $t('quests.sessions.managePage.map.subtitle') }}</p>
          </div>
        </div>
        <div class="map-canvas">
          <SessionMapView
            :checkpoints="questCheckpoints"
            :participants="participantLocationsArray"
            :show-checkpoints="state.showCheckpoints"
            :show-legend="true"
          />
        </div>
        <div class="card-footer">
          <div class="map-toggles">
            <RoundCheckbox v-model="state.showCheckpoints" :label="$t('quests.sessions.managePage.map.showCheckpoints')" />
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="info-card">
          <div class="card-header">
            <p class="card-title">{{ $t('quests.sessions.managePage.sessionInfo.title') }}</p>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('quests.sessions.managePage.sessionInfo.status') }}</span>
            <span class="info-value info-value--pill">
              <span class="status-dot status-dot--small"></span>
              {{ statusLabel }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('quests.sessions.managePage.sessionInfo.startTime') }}</span>
            <span class="info-value">{{ state.startTime || $t('quests.sessions.managePage.placeholders.notSet') }}</span>
          </div>
          <div v-if="state.sessionTimer" class="info-row">
            <span class="info-label">{{ state.status === 'scheduled' ? $t('quests.sessions.managePage.sessionInfo.countdown') : $t('quests.sessions.managePage.sessionInfo.duration') }}</span>
            <span class="info-value info-value--timer">{{ state.sessionTimer }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('quests.sessions.managePage.sessionInfo.participants') }}</span>
            <span class="info-value">
              <strong>{{ state.participants.current }}<template v-if="state.participants.max"> / {{ state.participants.max }}</template></strong>
            </span>
          </div>
          <div v-if="state.status === 'scheduled'" class="info-row info-row--invite">
            <span class="info-label">{{ $t('quests.sessions.managePage.sessionInfo.inviteLink') }}</span>
            <div class="invite-link-wrapper" @click="copyInviteLink">
              <span class="invite-link-text">{{ state.inviteLink || $t('quests.sessions.managePage.placeholders.notSet') }}</span>
              <span class="copy-icon" :class="{ copied: copyState === 'copied' }">
                <svg v-if="copyState !== 'copied'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div class="info-card participants-card">
          <div class="card-header">
            <p class="card-title">{{ $t('quests.sessions.managePage.participants.title') }}</p>
          </div>
          <div v-if="!state.participantsOverview.length" class="participants-empty">
            {{ $t('quests.sessions.managePage.participants.empty') || 'No participants yet.' }}
          </div>
          <div
              v-else
              v-for="participant in state.participantsOverview"
              :key="participant.id"
              class="participant-card"
              :class="{
                'participant-card--rejected': participant.participationStatus === 'rejected' || participant.participationStatus === 'disqualified'
              }"
          >
            <div class="participant-avatar-wrapper">
              <div class="participant-avatar" :class="{ 'participant-avatar--image': participant.photoUrl }">
                <img v-if="participant.photoUrl" :src="participant.photoUrl" :alt="participant.name" class="participant-avatar-img" />
                <span v-else>{{ participant.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div v-if="participant.isActive" class="participant-online-indicator"></div>
            </div>
            <div class="participant-info">
              <div class="participant-header">
                <p class="participant-name">
                  {{ participant.name }}
                  <span
                    v-if="participant.rejectionReason"
                    class="rejection-badge"
                    :title="$t(`quests.sessions.rejectionReason.${participant.rejectionReason}`)"
                  >
                    {{ $t(`quests.sessions.rejectionReason.${participant.rejectionReason}`) }}
                  </span>
                </p>
                <span
                  v-if="participant.participationStatus !== 'rejected' && participant.participationStatus !== 'disqualified'"
                  class="participant-score"
                >{{ participant.score }}</span>
              </div>
              <div class="progress-row">
                <div class="progress-track">
                  <div
                      class="progress-fill"
                      :style="{
                        width: `${participant.progress}%`,
                        backgroundColor: participant.barColor
                      }"
                  ></div>
                </div>
                <span class="progress-value">{{ participant.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    </div>

    <CreateSessionModal
      mode="edit"
      :visible="editModal.isOpen"
      :startDate="editModal.startDate"
      :error="editModal.error"
      :isSubmitting="editModal.isSubmitting"
      :translateWithFallback="translateWithFallback"
      :minStartDate="editModal.minStartDate"
      @update:startDate="editModal.startDate = $event"
      @close="closeEditModal"
      @submit="handleEditSubmit"
    />

    <ConfirmDialog
      :visible="confirmDialog.isOpen"
      :title="translateWithFallback('quests.sessions.managePage.confirmCancel.title', 'Cancel Session?')"
      :message="translateWithFallback('quests.sessions.managePage.confirmCancel.message', 'Are you sure you want to cancel this session? This action cannot be undone.')"
      :confirmText="translateWithFallback('quests.sessions.managePage.confirmCancel.confirm', 'Yes, Cancel Session')"
      :cancelText="translateWithFallback('common.cancel', 'Cancel')"
      :workingText="translateWithFallback('common.loading', 'Loading...')"
      :submitting="confirmDialog.isSubmitting"
      tone="danger"
      @confirm="confirmCancelSession"
      @cancel="closeConfirmDialog"
    />

    <PhotoModerationModal
      v-if="sessionId"
      :sessionId="sessionId"
      :isOpen="photoModerationModal.isOpen"
      @close="closePhotoModeration"
      @moderated="handlePhotoModerated"
    />
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import RoundCheckbox from '@/components/common/RoundCheckbox/RoundCheckbox.vue';
import SessionMapView from '@/components/common/SessionMapView/SessionMapView.vue';
import CreateSessionModal from '@/components/common/CreateSessionModal/CreateSessionModal.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import PhotoModerationModal from '@/components/features/sessions/PhotoModerationModal/PhotoModerationModal.vue';
import { useManageSessionForm } from './ManageSessionForm.ts';
import './ManageSessionForm.css';

const {
  state,
  statusLabel,
  sessionTitle,
  sessionId,
  copyState,
  copyInviteLink,
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
  photoModerationModal,
  pendingPhotosCount,
  openPhotoModeration,
  closePhotoModeration,
  handlePhotoModerated,
  translateWithFallback,
  actionError,
} = useManageSessionForm();
</script>
