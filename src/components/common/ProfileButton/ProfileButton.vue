<template>
  <button
      class="profile-button"
      :class="{ 'has-photo': hasPhoto }"
      :style="buttonStyle"
      @click="emit('click')"
      :title="title"
  >
    <img
        v-if="hasPhoto"
        :src="photoUrl"
        :alt="userName"
        class="profile-photo"
        @error="handleImageError"
    />
    <svg
        v-else
        class="profile-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
      <path d="M12 14C6.47715 14 2 18.4772 2 24H22C22 18.4772 17.5228 14 12 14Z" fill="currentColor"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { profileButtonDefaults, generateGradient } from './ProfileButton';
import type { ProfileButtonProps, ProfileButtonEmits } from './ProfileButton';
import './ProfileButton.css';

const props = withDefaults(defineProps<ProfileButtonProps>(), profileButtonDefaults);
const emit = defineEmits<ProfileButtonEmits>();

const imageError = ref(false);

const hasPhoto = computed(() => !!props.photoUrl && !imageError.value);

const buttonStyle = computed(() => {
  if (hasPhoto.value) return {};
  return { background: generateGradient(props.userName || '') };
});

const handleImageError = () => {
  imageError.value = true;
};
</script>