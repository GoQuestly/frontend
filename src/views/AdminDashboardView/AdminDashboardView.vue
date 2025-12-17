<template>
  <div class="admin-dashboard-view">
    <header class="admin-header">
      <div class="header-content">
        <h1 class="header-title">{{ $t('admin.dashboard.title') }}</h1>
        <div class="header-actions">
          <ThemeToggle />
          <LocaleToggle />
          <LogoutButton :custom-logout="handleAdminLogout" />
        </div>
      </div>
    </header>

    <div class="admin-tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        {{ $t('admin.dashboard.tabs.users') }}
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'statistics' }"
        @click="activeTab = 'statistics'"
      >
        {{ $t('admin.dashboard.tabs.statistics') }}
      </button>
    </div>

    <div class="admin-content">
      <UsersManagementTab v-if="activeTab === 'users'" />
      <StatisticsTab v-else-if="activeTab === 'statistics'" />
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import LogoutButton from '@/components/common/LogoutButton/LogoutButton.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import UsersManagementTab from '@/components/features/admin/UsersManagementTab/UsersManagementTab.vue';
import StatisticsTab from '@/components/features/admin/StatisticsTab/StatisticsTab.vue';
import { clearAdminAuth } from '@/utils/storage';

const router = useRouter();
const activeTab = ref<'users' | 'statistics'>('users');

const handleAdminLogout = async (): Promise<void> => {
  clearAdminAuth();
  await router.push({ name: 'admin-login' });
};
</script>

<style scoped src="./AdminDashboardView.css"></style>
