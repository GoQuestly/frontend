import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { sessionApi } from '@/api/sessionApi';
import type { PendingPhotoForModeration } from '@/types/session';

interface Props {
  sessionId: number;
  isOpen: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'moderated'): void;
}

export const usePhotoModerationModal = (props: Props, emit: Emits) => {
  const { t } = useI18n();

  const pendingPhotos = ref<PendingPhotoForModeration[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const moderating = ref<number | null>(null);
  const showRejectInput = ref<number | null>(null);
  const rejectionReason = ref('');

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
        errorMessage.value = t('quests.sessions.managePage.photoModeration.rejectionReason');
        return;
      }

      moderating.value = photoId;
      errorMessage.value = '';

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
    }
  });

  return {
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
  };
};
