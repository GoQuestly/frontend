<template>
  <div class="profile-edit-form">
    <div v-if="state.isLoading" class="profile-loading">
      <div class="spinner-large"></div>
    </div>

    <div v-else class="profile-card">
      <form @submit.prevent="handleSave">
        <div class="profile-content">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img
                  v-if="state.avatarUrl"
                  :src="state.avatarUrl"
                  :alt="state.name"
                  class="avatar-image"
                  @error="handleImageError"
              />
              <img
                  v-else
                  :src="defaultAvatar"
                  alt="Default Avatar"
                  class="avatar-image default"
              />

              <div v-if="state.isUploadingAvatar" class="avatar-loader">
                <div class="spinner"></div>
              </div>
            </div>

            <BaseButton
                type="button"
                variant="secondary"
                @click="triggerFileInput"
                :disabled="state.isUploadingAvatar || state.isSaving"
                class="change-photo-button"
            >
              {{ state.isUploadingAvatar ? uploadingText : changePhotoText }}
            </BaseButton>

            <p class="file-info">{{ fileInfoText }}</p>

            <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style="display: none"
                @change="onFileChange"
            />
          </div>

          <div class="form-section">
            <div class="messages-section">
              <ErrorBox v-if="state.error" :message="getTranslatedErrorMessage(state.error, $t)" />
              <SuccessBox v-if="state.successMessage" :message="$t(state.successMessage)" />
            </div>

            <div class="form-group">
              <label for="fullName" class="form-label">
                {{ fullNameLabel }}
              </label>
              <BaseInput
                  id="fullName"
                  v-model="state.name"
                  type="text"
                  :placeholder="fullNamePlaceholder"
                  :maxlength="100"
                  :disabled="state.isSaving || state.isUploadingAvatar"
                  class="form-input"
                  required
                  @input="handleNameChange"
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                {{ emailLabel }}
              </label>
              <BaseInput
                  id="email"
                  v-model="state.email"
                  type="email"
                  :disabled="true"
                  :placeholder="emailPlaceholder"
                  class="form-input"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <BaseButton
              type="button"
              variant="secondary"
              @click="handleCancel"
              :disabled="state.isSaving || state.isUploadingAvatar || !state.hasChanges"
              class="cancel-button"
          >
            {{ cancelText }}
          </BaseButton>

          <BaseButton
              type="submit"
              variant="primary"
              :disabled="state.isSaving || state.isUploadingAvatar || !state.hasChanges"
              class="save-button"
          >
            {{ state.isSaving ? savingText : saveChangesText }}
          </BaseButton>
        </div>
      </form>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import { getTranslatedErrorMessage } from '@/utils/errors';
import {
  createInitialProfileEditState,
  loadProfile,
  handleAvatarChange,
  handleSaveProfile,
  checkForChanges,
  resetChanges,
} from './ProfileEditForm.ts';
import { defaultAvatar } from '@/assets/images';
import './ProfileEditForm.css';

const router = useRouter();
const { t: $t } = useI18n();

const state = reactive(createInitialProfileEditState());
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await loadProfile(state, router);
});

const changePhotoText = computed(() => $t('profile.changePhoto'));
const uploadingText = computed(() => $t('common.uploading'));
const fileInfoText = computed(() => $t('profile.fileInfo'));
const fullNameLabel = computed(() => $t('common.name'));
const fullNamePlaceholder = computed(() => $t('profile.fullNamePlaceholder'));
const emailLabel = computed(() => $t('common.email'));
const emailPlaceholder = computed(() => $t('common.emailPlaceholder'));
const cancelText = computed(() => $t('common.cancel'));
const saveChangesText = computed(() => $t('profile.saveChanges'));
const savingText = computed(() => $t('common.saving'));

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleNameChange = () => {
  checkForChanges(state);
};

const handleImageError = () => {
  state.avatarUrl = undefined;
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    await handleAvatarChange(state, file, router);
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const handleSave = async () => {
  await handleSaveProfile(state, router);
};

const handleCancel = () => {
  resetChanges(state);
};
</script>