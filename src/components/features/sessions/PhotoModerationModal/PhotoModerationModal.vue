<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
        <div class="photo-moderation-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">{{ $t('quests.sessions.managePage.photoModeration.title') }}</h2>
            <button class="modal-close" @click="handleClose" :aria-label="$t('common.cancel')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="errorMessage" class="error-state">
              <ErrorBox :message="errorMessage" />
            </div>

            <div v-else-if="pendingPhotos.length === 0" class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>{{ $t('quests.sessions.managePage.photoModeration.noPending') }}</p>
            </div>

            <div v-else class="photos-list">
              <div v-for="photo in pendingPhotos" :key="photo.participantTaskPhotoId" class="photo-card">
                <div class="photo-header">
                  <div class="user-info">
                    <span class="user-name">{{ photo.userName }}</span>
                    <span class="upload-time">{{ formatUploadTime(photo.uploadDate) }}</span>
                  </div>
                  <span class="pending-badge">{{ $t('quests.sessions.managePage.photoModeration.pending') }}</span>
                </div>

                <div class="photo-details">
                  <div class="detail-row">
                    <span class="detail-label">{{ $t('quests.sessions.managePage.photoModeration.checkpoint') }}:</span>
                    <span class="detail-value">{{ photo.pointName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">{{ $t('quests.sessions.managePage.photoModeration.task') }}:</span>
                    <span class="detail-value">{{ photo.taskDescription }}</span>
                  </div>
                </div>

                <div class="photo-preview">
                  <img
                    :src="getPhotoUrl(photo.photoUrl)"
                    :alt="`${photo.userName} - ${photo.taskDescription}`"
                    @click="openFullImage(photo.photoUrl)"
                  />
                </div>

                <div v-if="showRejectInput === photo.participantTaskPhotoId" class="reject-input">
                  <label class="reject-label">{{ $t('quests.sessions.managePage.photoModeration.rejectionReason') }}</label>
                  <textarea
                    v-model="rejectionReason"
                    class="reject-textarea"
                    :placeholder="$t('quests.sessions.managePage.photoModeration.rejectionPlaceholder')"
                    rows="3"
                  ></textarea>
                </div>

                <div class="photo-actions">
                  <BaseButton
                    variant="secondary"
                    :disabled="moderating === photo.participantTaskPhotoId"
                    @click="handleReject(photo.participantTaskPhotoId)"
                  >
                    {{ moderating === photo.participantTaskPhotoId && showRejectInput === photo.participantTaskPhotoId
                      ? $t('quests.sessions.managePage.photoModeration.rejecting')
                      : $t('quests.sessions.managePage.photoModeration.reject')
                    }}
                  </BaseButton>
                  <BaseButton
                    variant="primary"
                    :disabled="moderating === photo.participantTaskPhotoId"
                    @click="handleApprove(photo.participantTaskPhotoId)"
                  >
                    {{ moderating === photo.participantTaskPhotoId && showRejectInput !== photo.participantTaskPhotoId
                      ? $t('quests.sessions.managePage.photoModeration.approving')
                      : $t('quests.sessions.managePage.photoModeration.approve')
                    }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import { usePhotoModerationModal } from './PhotoModerationModal';

interface Props {
  sessionId: number;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'moderated'): void;
}>();

const {
  pendingPhotos,
  isLoading,
  errorMessage,
  moderating,
  showRejectInput,
  rejectionReason,
  getPhotoUrl,
  formatUploadTime,
  openFullImage,
  handleApprove,
  handleReject,
  handleClose,
  handleBackdropClick,
} = usePhotoModerationModal(props, emit);
</script>

<style scoped src="./PhotoModerationModal.css"></style>
