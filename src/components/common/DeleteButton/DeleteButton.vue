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
interface Props {
  title?: string;
}

defineProps<Props>();
defineEmits<{
  (e: 'click'): void;
}>();

</script>

<style scoped src="./DeleteButton.css"></style>