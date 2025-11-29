<template>
  <CreateQuestView mode="edit" :quest-id="questId" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CreateQuestView from '@/views/CreateQuestView/CreateQuestView.vue';

const route = useRoute();

const questId = computed(() => {
  const rawId = route.params.questId as string | undefined;
  if (!rawId) return null;
  const parsed = parseInt(rawId, 10);
  return Number.isNaN(parsed) ? null : parsed;
});
</script>
