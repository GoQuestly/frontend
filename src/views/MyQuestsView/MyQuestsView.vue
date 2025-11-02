<template>
  <div class="my-quests-view">
    <SimpleHeader currentPage="my-quests" />
    <main class="my-quests-main">
      <MyQuestsForm/>
    </main>
  </div>
</template>

<script setup lang="ts">
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import MyQuestsForm from '@/components/features/quests/MyQuestsForm/MyQuestsForm.vue';
import './MyQuestsView.css';
</script>