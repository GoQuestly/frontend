<template>
  <div class="quest-information-step">
    <h2 class="step-title">{{ $t('quests.createQuest.step1.title') }}</h2>

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

              <template v-if="!coverImageFile && !coverImagePreview">
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
                  <img :src="coverImagePreview" alt="Cover preview" class="cover-preview" />
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

          <div class="form-field">
            <div class="form-field-inline">
              <label class="field-label">
                {{ $t('quests.createQuest.step1.publicProgress') }}
              </label>
              <label class="toggle-switch">
                <input
                    type="checkbox"
                    v-model="localData.publicProgressVisibility"
                    @change="updateField('publicProgressVisibility', localData.publicProgressVisibility)"
                />
                <span class="toggle-slider"></span>
              </label>
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
                  @update-coordinates="updateStartingCoordinates"
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
                required
                @update:model-value="handleNumberInput('startRadius', $event)"
            />
          </div>
        </div>
      </div>
    </form>

    <div class="quest-information-step__actions">
      <SuccessBox
          v-if="successMessageToShow"
          :message="successMessageToShow"
          class="quest-information-step__success"
      />
      <BaseButton
          variant="secondary"
          class="save-changes-button"
          :disabled="isSaving"
          @click="handleSaveClick"
      >
        {{ $t('quests.createQuest.step1.saveChanges') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import LeafletMapView from '@/components/common/LeafletMapView/LeafletMapView.vue';
import { useQuestInformationStep } from './QuestInformationStep';
import type { QuestFormData } from '@/types/form';
import './QuestInformationStep.css';

interface Props {
  modelValue: QuestFormData;
  questId?: number | null;
  existingPhotoUrl?: string;
  isSaving?: boolean;
  successMessage?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: QuestFormData): void;
  (e: 'cover-image-change', file: File | null): void;
  (e: 'save'): void;
}>();

const {
  localData,
  formRef,
  fileInputRef,
  coverImageFile,
  coverImagePreview,
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
} = useQuestInformationStep(props, emit);

const isSaving = computed(() => props.isSaving ?? false);
const successMessageToShow = computed(() => props.successMessage ?? '');

defineExpose({
  validate,
  getCoverImageFile: () => coverImageFile.value,
});

const handleSaveClick = (): void => {
  if (!validate()) {
    return;
  }
  emit('save');
};
</script>