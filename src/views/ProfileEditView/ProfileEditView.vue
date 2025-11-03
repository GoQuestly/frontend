<template>
  <div class="profile-edit-view">
    <SimpleHeader currentPage="profile" />
    <main class="profile-edit-main">
      <div class="page-header-container">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-description">{{ pageDescription }}</p>
      </div>
      <ProfileEditForm />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import ProfileEditForm from '@/components/features/profile/ProfileEditForm/ProfileEditForm.vue';
import './ProfileEditView.css';

const { t } = useI18n();

const pageTitle = computed(() => t('profile.title'));
const pageDescription = computed(() => t('profile.subtitle'));
</script>