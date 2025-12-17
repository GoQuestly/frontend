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
                    :class="{ 'reject-textarea-error': rejectionReasonError }"
                    :placeholder="$t('quests.sessions.managePage.photoModeration.rejectionPlaceholder')"
                    rows="3"
                    @input="rejectionReasonError = ''"
                  ></textarea>
                  <span v-if="rejectionReasonError" class="reject-error">{{ rejectionReasonError }}</span>
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
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { sessionApi } from '@/api/sessionApi';
import type { PendingPhotoForModeration } from '@/types/session';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';

interface Props {
  sessionId: number;
  isOpen: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'moderated'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const pendingPhotos = ref<PendingPhotoForModeration[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const moderating = ref<number | null>(null);
const showRejectInput = ref<number | null>(null);
const rejectionReason = ref('');
const rejectionReasonError = ref('');

const getPhotoUrl = (photoUrl: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.go-questly.pp.ua/';
  return `${baseUrl.replace(/\/$/, '')}${photoUrl}`;
};

const formatUploadTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('quests.sessions.managePage.lastSyncJustNow');
  if (minutes < 60) return `${minutes} ${t('common.min')}`;
  if (hours < 24) return `${hours} ${t('common.hr')}`;
  return `${days}d`;
};

const openFullImage = (photoUrl: string) => {
  window.open(getPhotoUrl(photoUrl), '_blank');
};

const loadPendingPhotos = async () => {
  if (!props.sessionId) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    pendingPhotos.value = await sessionApi.getPendingPhotos(props.sessionId);
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || t('quests.sessions.managePage.photoModeration.moderationFailed');
  } finally {
    isLoading.value = false;
  }
};

const handleApprove = async (photoId: number) => {
  moderating.value = photoId;
  errorMessage.value = '';

  try {
    await sessionApi.moderatePhoto(props.sessionId, photoId, { approved: true });
    pendingPhotos.value = pendingPhotos.value.filter(p => p.participantTaskPhotoId !== photoId);
    emit('moderated');
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || t('quests.sessions.managePage.photoModeration.moderationFailed');
  } finally {
    moderating.value = null;
  }
};

const handleReject = async (photoId: number) => {
  if (showRejectInput.value === photoId) {
    if (!rejectionReason.value.trim()) {
      rejectionReasonError.value = t('quests.sessions.managePage.photoModeration.rejectionReason');
      return;
    }

    moderating.value = photoId;
    errorMessage.value = '';
    rejectionReasonError.value = '';

    try {
      await sessionApi.moderatePhoto(props.sessionId, photoId, {
        approved: false,
        rejectionReason: rejectionReason.value.trim()
      });
      pendingPhotos.value = pendingPhotos.value.filter(p => p.participantTaskPhotoId !== photoId);
      showRejectInput.value = null;
      rejectionReason.value = '';
      emit('moderated');
    } catch (error: any) {
      errorMessage.value = error?.response?.data?.message || t('quests.sessions.managePage.photoModeration.moderationFailed');
    } finally {
      moderating.value = null;
    }
  } else {
    showRejectInput.value = photoId;
    rejectionReason.value = '';
    rejectionReasonError.value = '';
  }
};

const handleClose = () => {
  if (moderating.value) return;
  emit('close');
};

const handleBackdropClick = () => {
  handleClose();
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadPendingPhotos();
    showRejectInput.value = null;
    rejectionReason.value = '';
    rejectionReasonError.value = '';
  }
});

defineExpose({
  refresh: loadPendingPhotos,
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.photo-moderation-modal {
  background-color: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: color 0.2s;
  border-radius: 6px;
}

.modal-close:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.photos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.photo-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.photo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.upload-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pending-badge {
  background-color: var(--color-warning);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.photo-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
}

.photo-preview {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-tertiary);
  cursor: pointer;
}

.photo-preview img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.photo-preview:hover {
  opacity: 0.9;
}

.reject-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reject-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.reject-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.reject-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.reject-textarea-error {
  border-color: var(--color-danger);
}

.reject-textarea-error:focus {
  border-color: var(--color-danger);
}

.reject-error {
  color: var(--color-danger);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.photo-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .photo-moderation-modal,
.modal-leave-active .photo-moderation-modal {
  transition: transform 0.3s;
}

.modal-enter-from .photo-moderation-modal,
.modal-leave-to .photo-moderation-modal {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .photo-moderation-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-body {
    padding: 1rem;
  }

  .photos-list {
    gap: 1rem;
  }

  .photo-actions {
    flex-direction: column-reverse;
  }

  .photo-actions button {
    width: 100%;
  }
}
</style>
