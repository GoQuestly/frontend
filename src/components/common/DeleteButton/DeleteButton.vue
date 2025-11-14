<template>
  <button
      class="delete-btn"
      type="button"
      @click.stop="$emit('click')"
      :title="title || $t('common.delete')"
  >
    <img src="@/assets/images/delete-icon.png" alt="Delete" />
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
  title?: string;
}

defineProps<Props>();
defineEmits<{
  (e: 'click'): void;
}>();

const { t } = useI18n();
</script>

<style scoped src="./DeleteButton.css"></style>