<template>
  <div class="create-quest-view">
    <SimpleHeader currentPage="my-quests" />
    <main class="create-quest-main">
      <div class="create-quest-form">
        <div class="form-header" :class="{ 'form-header--with-actions': isEditMode }">
          <div class="form-header__info">
            <h1>{{ headerTitle }}</h1>
            <p class="form-subtitle">{{ headerSubtitle }}</p>
          </div>
          <div v-if="isEditMode" class="form-header__actions">
            <BaseButton
                variant="secondary"
                class="header-action-btn"
                :disabled="!hasQuestId || state.isSubmitting || state.isLoadingQuest"
                @click="handleBackToSessions"
            >
              {{ $t('quests.createQuest.backToSessions') }}
            </BaseButton>
            <BaseButton
                variant="secondary"
                class="header-action-btn header-action-btn--delete"
                :disabled="!hasQuestId || state.isSubmitting || state.isLoadingQuest"
                @click="openDeleteConfirm"
            >
              <img src="@/assets/images/delete-icon.png" alt="Delete" class="header-delete-icon" />
              <span>{{ $t('common.delete') }}</span>
            </BaseButton>
            <BaseButton
                variant="primary"
                class="header-action-btn"
                :disabled="state.isSubmitting || state.isLoadingQuest"
                @click="handleSaveQuestInformation"
            >
              {{ $t('quests.createQuest.step1.saveChanges') }}
            </BaseButton>
          </div>
        </div>

        <SuccessBox
            v-if="isEditMode && successMessage"
            :message="successMessage"
            class="limited-edit-success"
        />
        <ErrorBox :message="state.uploadError" class="top-upload-error" />

        <StepIndicator
            v-if="!isEditMode"
            :current-step="state.currentStep"
            :steps="steps"
            :quest-id="state.questId"
            @step-click="handleStepClick"
        />

        <div class="form-content-wrapper">
          <div v-if="!isEditMode" class="form-content">
            <QuestInformationStep
                v-if="state.currentStep === 1"
                ref="questInformationStepRef"
                :model-value="state.formData"
                :quest-id="state.questId"
                :existing-photo-url="state.photoUrl"
                :success-message="successMessage"
                @cover-image-change="handleCoverImageChange"
                @save="handleSaveQuestInformation"
            />

            <CheckpointsSetupStep
                v-if="state.currentStep === 2 && state.questId !== null"
                :key="`checkpoints-${state.questId}`"
                ref="checkpointsSetupStepRef"
                v-model="state.formData"
                :quest-id="state.questId"
            />

            <TaskAssignmentStep
                v-if="state.currentStep === 3 && state.questId !== null"
                :key="`tasks-${state.questId}`"
                v-model="state.formData"
                :quest-id="state.questId"
            />

            <ReviewStep
                v-if="state.currentStep === 4 && state.questId !== null"
                :key="`review-${state.questId}`"
                :model-value="state.formData"
                :quest-id="state.questId"
                :cover-image-preview="coverImagePreview"
            />

            <div v-if="(state.currentStep === 2 || state.currentStep === 3 || state.currentStep === 4) && state.questId === null" class="no-quest-message">
              <p>{{ $t('quests.createQuest.errors.questNotCreated') }}</p>
              <BaseButton variant="primary" @click="state.currentStep = 1">
                {{ $t('quests.createQuest.goToStep1') }}
              </BaseButton>
            </div>
          </div>

          <div v-else class="form-content edit-flow">
            <section class="edit-section">
              <QuestInformationStep
                  ref="questInformationStepRef"
                  :model-value="state.formData"
                  :quest-id="state.questId"
                  :existing-photo-url="state.photoUrl"
                  :success-message="successMessage"
                  @cover-image-change="handleCoverImageChange"
                  @save="handleSaveQuestInformation"
              />
            </section>

            <section class="edit-section" v-if="state.questId !== null">
              <CheckpointsSetupStep
                  :key="`checkpoints-${state.questId}`"
                  ref="checkpointsSetupStepRef"
                  v-model="state.formData"
                  :quest-id="state.questId"
              />
            </section>

            <section class="edit-section" v-if="state.questId !== null">
              <TaskAssignmentStep
                  :key="`tasks-${state.questId}`"
                  v-model="state.formData"
                  :quest-id="state.questId"
              />
            </section>

            <div v-if="state.questId === null" class="no-quest-message">
              <p>{{ $t('quests.createQuest.errors.questNotCreated') }}</p>
            </div>
          </div>
        </div>

        <div v-if="!isEditMode" class="form-actions">
          <BaseButton
              v-if="state.currentStep === 1"
              variant="secondary"
              @click="handleCancel"
              class="action-button action-button--secondary"
          >
            {{ $t('common.cancel') }}
          </BaseButton>

          <BaseButton
              v-else
              variant="secondary"
              @click="handleBack"
              class="action-button action-button--secondary"
          >
            {{ $t('common.back') }}
          </BaseButton>

          <BaseButton
              variant="primary"
              @click="handleNext"
              :disabled="state.isSubmitting"
              class="action-button action-button--primary"
          >
            {{ getNextButtonText() }}
          </BaseButton>
        </div>

        <Footer />
      </div>
    </main>
  </div>

  <ConfirmDialog
      :visible="confirmDialogState.visible"
      :title="confirmDialogState.title"
      :message="confirmDialogState.message"
      :confirm-text="confirmDialogState.confirmText"
      :cancel-text="confirmDialogState.cancelText"
      :working-text="confirmDialogState.workingText"
      :submitting="state.isSubmitting"
      :tone="confirmDialogState.tone"
      @confirm="handleConfirmApprove"
      @cancel="handleConfirmCancel"
  />
</template>

<script setup lang="ts">
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog.vue';
import StepIndicator from '@/components/common/StepIndicator/StepIndicator.vue';
import QuestInformationStep from '@/components/features/quests/StepsForms/QuestInformationStep/QuestInformationStep.vue';
import CheckpointsSetupStep from '@/components/features/quests/StepsForms/CheckpointsSetupStep/CheckpointsSetupStep.vue';
import TaskAssignmentStep from '@/components/features/quests/StepsForms/TaskAssignmentStep/TaskAssignmentStep.vue';
import ReviewStep from '@/components/features/quests/StepsForms/ReviewStep/ReviewStep.vue';
import { useCreateQuestView } from './CreateQuestView';
import './CreateQuestView.css';

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit';
  questId?: number | null;
}>(), {
  mode: 'create',
  questId: null,
});

const {
  state,
  isEditMode,
  headerTitle,
  headerSubtitle,
  hasQuestId,
  successMessage,
  questInformationStepRef,
  checkpointsSetupStepRef,
  confirmDialogState,
  steps,
  coverImagePreview,
  handleCoverImageChange,
  handleStepClick,
  handleBack,
  handleBackToSessions,
  openDeleteConfirm,
  handleSaveQuestInformation,
  handleNext,
  handleCancel,
  getNextButtonText,
  handleConfirmApprove,
  handleConfirmCancel,
} = useCreateQuestView(props);
</script>

<style src="./CreateQuestView.css"></style>
