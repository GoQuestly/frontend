<template>
  <div class="create-quest-view">
    <SimpleHeader currentPage="my-quests" />
    <main class="create-quest-main">
      <CreateQuestForm />
    </main>
  </div>
</template>

<script setup lang="ts">
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import CreateQuestForm from '@/components/features/quests/CreateQuestForm/CreateQuestForm.vue';
import './CreateQuestView.css';
</script>