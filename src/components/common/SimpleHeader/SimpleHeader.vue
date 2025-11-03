<template>
  <header class="simple-header">
    <div class="simple-header-container">
      <div class="header-left">
        <div class="logo-link" @click="handleLogoClick">
          <img :src="HEADER_CONFIG.logoSrc" :alt="HEADER_CONFIG.logoAlt" class="logo-icon" />
          <span class="logo-text">{{ HEADER_CONFIG.logoText }}</span>
        </div>

        <nav v-if="isAuthenticated" class="header-nav">
          <HeaderNavButton
              v-for="item in visibleNavItems"
              :key="item.route"
              :label="$t(`navigation.${item.label.toLowerCase().replace(' ', '')}`) || item.label"
              :active="isActiveRoute(item.route)"
              @click="handleNavClick(item.route)"
          />
        </nav>
      </div>

      <div class="header-actions">
        <ThemeToggle />
        <LocaleToggle />
        <ProfileButton
            v-if="isAuthenticated"
            :title="$t('navigation.profile') || 'profile'"
            :user-name="userName"
            :photo-url="userPhotoUrl"
            @click="handleProfileClick"
        />
        <LogoutButton v-if="isLoggedIn" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import LogoutButton from '@/components/common/LogoutButton/LogoutButton.vue';
import HeaderNavButton from '@/components/common/HeaderNavButton/HeaderNavButton.vue';
import ProfileButton from '@/components/common/ProfileButton/ProfileButton.vue';
import {
  HEADER_CONFIG,
  getUserData,
  getVisibleNavItems,
  checkIsActiveRoute,
  handleProfileNavigation,
  handleLogoNavigation,
  handleMyQuestsNavigation,
} from './SimpleHeader.ts';
import './SimpleHeader.css';

const route = useRoute();
const router = useRouter();

const { isAuthenticated, isLoggedIn, user } = getUserData();
const visibleNavItems = computed(() => getVisibleNavItems(isAuthenticated.value));
const isActiveRoute = (routePath: string) => checkIsActiveRoute(route, routePath);
const userName = computed(() => user.value?.name || '');
const userPhotoUrl = computed(() => user.value?.photo_url);

const handleProfileClick = () => handleProfileNavigation(router);
const handleLogoClick = () => handleLogoNavigation(router);
const handleNavClick = (routePath: string) => {
  if (routePath === '/my-quests') {
    handleMyQuestsNavigation(router);
  } else {
    router.replace(routePath);
  }
};
</script>