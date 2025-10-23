<template>
  <div class="feature-card">
    <div class="feature-icon">
      <img :src="iconSrc" :alt="iconAlt" />
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { FeatureCardProps } from './FeatureCard';

defineProps<FeatureCardProps>();
</script>

<style src="./FeatureCard.css" scoped></style>