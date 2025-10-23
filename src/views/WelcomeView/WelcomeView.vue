<template>
  <div class="welcome-container">
    <div class="controls">
      <LocaleToggle />
    </div>

    <div class="hero-section">
      <div class="logo">
        <img :src="logoImage" alt="GoQuestly Logo" />
      </div>
      <h1>{{ $t('auth.welcome.title') }}</h1>
      <p class="subtitle">{{ $t('auth.welcome.subtitle') }}</p>
      <p class="description">{{ $t('auth.welcome.description') }}</p>
    </div>

    <div class="features">
      <FeatureCard
          :icon-src="mapIcon"
          icon-alt="Create icon"
          :title="$t('auth.welcome.features.create.title')"
          :description="$t('auth.welcome.features.create.description')"
      />

      <FeatureCard
          :icon-src="usersIcon"
          icon-alt="Host icon"
          :title="$t('auth.welcome.features.host.title')"
          :description="$t('auth.welcome.features.host.description')"
      />

      <FeatureCard
          :icon-src="chartIcon"
          icon-alt="Results icon"
          :title="$t('auth.welcome.features.results.title')"
          :description="$t('auth.welcome.features.results.description')"
      />
    </div>

    <div class="cta-section">
      <BaseButton @click="handleStartClick">
        {{ $t('auth.welcome.startButton') }}
      </BaseButton>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Footer from "@/components/common/Footer/Footer.vue";
import BaseButton from "@/components/base/BaseButton/BaseButton.vue";
import LocaleToggle from "@/components/common/LocaleToggle/LocaleToggle.vue";
import FeatureCard from "@/components/common/FeatureCard/FeatureCard.vue";
import { handleWelcomeStartClick } from './WelcomeView';

const router = useRouter();

const logoImage = new URL('@/assets/images/logo.png', import.meta.url).href;
const mapIcon = new URL('@/assets/images/map-icon.png', import.meta.url).href;
const usersIcon = new URL('@/assets/images/users-icon.png', import.meta.url).href;
const chartIcon = new URL('@/assets/images/chart-icon.png', import.meta.url).href;

const handleStartClick = (): void => {
  handleWelcomeStartClick(router);
};
</script>

<style src="./WelcomeView.css" scoped></style>