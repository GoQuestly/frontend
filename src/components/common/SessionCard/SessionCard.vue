<template>
  <div class="session-card">
    <div class="session-card__header">
      <h3 class="session-name">{{ session.name }}</h3>
      <span class="status-pill" :class="`status-${session.status}`">
        {{ statusLabel }}
      </span>
    </div>
    <div class="session-info">
      <div class="session-row">
        <span class="label">{{ $t('quests.sessions.starts') }}:</span>
        <span class="value">{{ session.start }}</span>
      </div>
      <div class="session-row">
        <span class="label">{{ $t('quests.sessions.participants') }}:</span>
        <span class="value">{{ session.participants }}</span>
      </div>
    </div>
    <BaseButton variant="primary" class="manage-button" @click="handleManage">
      {{ $t('quests.sessions.manage') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import type { SessionCardProps } from './SessionCard';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import './SessionCard.css';

const props = defineProps<{
  session: SessionCardProps;
}>();

const emit = defineEmits<{
  (e: 'manage', sessionId: string): void;
}>();

const { t } = useI18n();
const statusLabel = computed(() => {
  const key = props.session.status === 'in-progress' ? 'inProgress' : props.session.status;
  return props.session.statusLabel ?? t(`quests.sessions.status.${key}` as never);
});

const handleManage = () => {
  emit('manage', props.session.id);
};
</script>
