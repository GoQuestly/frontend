<template>
  <div class="manage-session-view">
    <SimpleHeader currentPage="my-quests" />
    <main class="manage-session-main">
      <ManageSessionForm />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import ManageSessionForm from '@/components/features/sessions/ManageSessionForm/ManageSessionForm.vue';
import './ManageSessionFormView.css';
</script>
