<template>
  <button
      class="delete-btn"
      type="button"
      @click.stop="$emit('click')"
      :title="title || $t('common.delete')"
  >
    <img :src="deleteIcon" alt="Delete" />
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { deleteIcon } from '@/assets/images';

interface Props {
  title?: string;
}

defineProps<Props>();
defineEmits<{
  (e: 'click'): void;
}>();

const { t: $t } = useI18n();
</script>

<style scoped src="./DeleteButton.css"></style>
