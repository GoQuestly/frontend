<template>
  <div class="quest-information-step">
    <h2 class="step-title">{{ stepTitle }}</h2>

    <form ref="formRef" @submit.prevent>
      <div class="form-grid">
        <div class="form-section">
          <div class="form-field">
            <label class="field-label">
              {{ $t('quests.createQuest.step1.questTitle') }}
              <span class="required">*</span>
            </label>
            <BaseInput
                v-model="localData.title"
                :placeholder="$t('quests.createQuest.step1.titlePlaceholder')"
                :maxlength="300"
                required
                @update:model-value="updateField('title', $event)"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ $t('quests.createQuest.step1.questDescription') }}
            </label>
            <textarea
                v-model="localData.description"
                :placeholder="$t('quests.createQuest.step1.descriptionPlaceholder')"
                class="base-textarea"
                rows="4"
                maxlength="500"
                @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              {{ $t('quests.createQuest.step1.coverImage') }}
            </label>
            <div class="field-error">
              <ErrorBox :message="errors.coverImage" />
            </div>
            <div
                class="file-upload-area"
                :class="{ 'has-file': coverImageFile || coverImagePreview }"
                @click="triggerFileInput"
                @drop.prevent="handleDrop"
                @dragover.prevent
                @dragenter.prevent
            >
              <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  style="display: none"
                  @change="handleFileSelect"
              />

              <template v-if="(!coverImageFile && !coverImagePreview) || imageLoadError">
                <div class="upload-icon">
                  <img src="@/assets/images/cloud-upload.png" alt="Upload" />
                </div>
                <p class="upload-text">
                  <span class="upload-link">{{ $t('quests.createQuest.step1.uploadFile') }}</span>
                  {{ $t('quests.createQuest.step1.orDragDrop') }}
                </p>
                <p class="upload-hint">{{ $t('quests.createQuest.step1.imageHint') }}</p>
              </template>

              <template v-else>
                <div class="preview-container">
                  <img :src="coverImagePreview" alt="Cover preview" class="cover-preview" @error="handleImageError" />
                  <div class="preview-overlay">
                    <p v-if="coverImageFile?.name" class="preview-filename">{{ coverImageFile?.name }}</p>
                    <button type="button" class="remove-btn" @click.stop="removeCoverImage">
                      {{ $t('common.remove') }}
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="participants-duration-wrapper">
            <div v-if="errors.participantsLimit" class="participants-limit-error-overlay">
              <ErrorBox :message="errors.participantsLimit" />
            </div>

            <div class="three-fields-row">
              <div class="form-field form-field--compact">
                <div v-if="!errors.participantsLimit && errors.minParticipants" class="field-error">
                  <ErrorBox :message="errors.minParticipants" />
                </div>
                <label class="field-label">
                  {{ $t('quests.createQuest.step1.minParticipants') }}
                  <span class="required">*</span>
                </label>
                <BaseInput
                    :model-value="localData.minParticipants === 0 || localData.minParticipants ? String(localData.minParticipants) : ''"
                    type="number"
                    numbers-only
                    :min="1"
                    :max="100"
                    required
                    @update:model-value="handleNumberInput('minParticipants', $event)"
                />
              </div>

              <div class="form-field form-field--compact">
                <div v-if="!errors.participantsLimit && errors.maxParticipants" class="field-error">
                  <ErrorBox :message="errors.maxParticipants" />
                </div>
                <label class="field-label">
                  {{ $t('quests.createQuest.step1.maxParticipants') }}
                  <span class="required">*</span>
                </label>
                <BaseInput
                    :model-value="localData.maxParticipants === 0 || localData.maxParticipants ? String(localData.maxParticipants) : ''"
                    type="number"
                    numbers-only
                    :min="1"
                    :max="100"
                    required
                    @update:model-value="handleNumberInput('maxParticipants', $event)"
                />
              </div>

              <div class="form-field form-field--compact">
                <div v-if="errors.maxDuration" class="field-error">
                  <ErrorBox :message="errors.maxDuration" />
                </div>
                <label class="field-label">
                  {{ $t('quests.createQuest.step1.maxDuration') }}
                  <span class="required">*</span>
                </label>
                <BaseInput
                    :model-value="localData.maxDuration === 0 || localData.maxDuration ? String(localData.maxDuration) : ''"
                    type="number"
                    numbers-only
                    :min="10"
                    :max="1440"
                    required
                    @update:model-value="handleNumberInput('maxDuration', $event)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="form-field">
            <label class="field-label">
              {{ $t('quests.createQuest.step1.startingArea') }}
              <span class="required">*</span>
            </label>
            <div class="map-wrapper">
              <LeafletMapView
                  :checkpoints="[startingPointCheckpoint]"
                  :selected-checkpoint-id="'starting-point'"
                  :show-instructions="false"
                  :interactive="true"
                  :editable="true"
                  @update-coordinates="handleMapUpdate"
              />
              <p class="map-hint">{{ $t('quests.createQuest.step1.mapPlaceholder') }}</p>
            </div>
            <div class="coordinates">
              <p>{{ $t('common.latitude') }}: {{ localData.startingLat.toFixed(4) }}</p>
              <p>{{ $t('common.longitude') }}: {{ localData.startingLng.toFixed(4) }}</p>
            </div>
          </div>

          <div class="form-field">
            <div class="field-error">
              <ErrorBox :message="errors.startRadius" />
            </div>
            <label class="field-label">
              {{ $t('quests.createQuest.step1.startRadius') }}
              <span class="required">*</span>
            </label>
            <BaseInput
                :model-value="localData.startRadius === 0 || localData.startRadius ? String(localData.startRadius) : ''"
                type="number"
                numbers-only
                :min="20"
                :max="10000"
                required
                @update:model-value="handleNumberInput('startRadius', $event)"
            />
          </div>
        </div>
      </div>
      <div class="quest-information-step__actions">
        <SuccessBox
            v-if="successMessage"
            :message="successMessage"
            class="quest-information-step__success"
        />
        <BaseButton
            class="save-changes-button"
            variant="primary"
            @click="$emit('save')"
        >
          {{ $t('quests.createQuest.step1.saveChanges') }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import LeafletMapView from '@/components/common/LeafletMapView/LeafletMapView.vue';
import { useI18n } from 'vue-i18n';
import { useQuestInformationStep } from './QuestInformationStep';
import type { QuestFormData } from '@/types/form';
import './QuestInformationStep.css';

interface Props {
  modelValue: QuestFormData;
  questId?: number | null;
  existingPhotoUrl?: string;
  successMessage?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'cover-image-change', file: File | null): void;
  (e: 'save'): void;
}>();

const {
  localData,
  formRef,
  fileInputRef,
  coverImageFile,
  coverImagePreview,
  imageLoadError,
  errors,
  startingPointCheckpoint,
  triggerFileInput,
  handleFileSelect,
  handleDrop,
  removeCoverImage,
  updateField,
  handleNumberInput,
  updateStartingCoordinates,
  validate,
  getFormValues,
  resetToModelValue,
  handleImageError,
} = useQuestInformationStep(props, emit);

const { t: $t } = useI18n();
const stepTitle = computed(() => $t('quests.createQuest.step1.title'));
const handleMapUpdate = (id: string, lat: number, lng: number) => {
  updateStartingCoordinates(id, lat, lng);
};

defineExpose({
  validate,
  getFormValues,
  resetToModelValue,
});
</script>
