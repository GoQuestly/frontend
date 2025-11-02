<template>
  <div class="quest-card" @click="handleClick">
    <div class="quest-header">
      <div v-if="quest.imageUrl" class="quest-image">
        <img :src="quest.imageUrl" :alt="quest.title" />
      </div>
      <div v-else class="quest-placeholder">
        <div class="placeholder-content">
          <img src="@/assets/images/camera-icon.png" alt="No image" class="camera-icon" />
        </div>
      </div>

      <div class="quest-header-overlay">
        <div class="quest-title">{{ quest.title }}</div>
      </div>
    </div>

    <div class="quest-description">
      <p v-if="quest.description">{{ quest.description }}</p>
      <p v-else class="no-description">
        {{ $t('myQuests.noDescription') }}
      </p>
    </div>

    <div class="quest-info">
      <div class="info-item">
        <img src="@/assets/images/flag-icon.png" alt="Checkpoints" class="info-icon" />
        <span>{{ quest.checkpointsCount }} {{ $t('myQuests.checkpoints') }}</span>
      </div>
      <div class="info-item">
        <img src="@/assets/images/timer-icon.png" alt="Duration" class="info-icon" />
        <span>{{ formatDurationForCard(quest.estimatedDuration, $t) }}</span>
      </div>
    </div>

    <div class="quest-dates">
      <div v-if="quest.lastSessionDate" class="date-item">
        <span class="date-label">{{ $t('myQuests.last') }}:</span>
        <span class="date-value">{{ quest.lastSessionDate }}</span>
      </div>
      <div v-else class="date-item empty-date">
        <span class="no-session">{{ $t('myQuests.noSessionData') }}</span>
      </div>

      <div v-if="quest.nextSessionDate" class="date-item">
        <span class="date-label">{{ $t('myQuests.next') }}:</span>
        <span class="date-value">{{ quest.nextSessionDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDurationForCard } from './QuestCard';
import type { QuestCardProps, QuestCardEmits } from './QuestCard';
import './QuestCard.css';

const { quest } = defineProps<QuestCardProps>();
const emit = defineEmits<QuestCardEmits>();

const handleClick = () => {
  emit('click', quest.id);
};
</script>