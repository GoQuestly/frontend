<template>
  <div class="quest-sessions-view">
    <SimpleHeader currentPage="my-quests" />
    <main class="quest-sessions-main">
      <QuestSessionsForm />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import QuestSessionsForm from '@/components/features/sessions/QuestSessionsForm/QuestSessionsForm.vue';
import './QuestSessionsView.css';
</script>
