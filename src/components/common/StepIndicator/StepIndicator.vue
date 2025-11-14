<template>
  <div class="step-indicator">
    <template v-for="(step, index) in steps" :key="step.number">
      <div class="step-item">
        <div
            class="step-circle"
            :class="{
              active: step.number === currentStep,
              completed: step.number < currentStep,
              disabled: !canNavigateToStep(step.number)
            }"
            @click="handleStepClick(step.number)"
        >
          {{ step.number }}
        </div>
        <span
            class="step-label"
            :class="{
              active: step.number === currentStep,
              completed: step.number < currentStep,
              disabled: !canNavigateToStep(step.number)
            }"
            @click="handleStepClick(step.number)"
        >
          {{ step.label }}
        </span>
      </div>
      <div
          v-if="index < steps.length - 1"
          class="step-line"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useStepIndicator } from './StepIndicator';

interface Step {
  number: number;
  label: string;
}

interface Props {
  currentStep: number;
  steps: Step[];
  questId: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'step-click', step: number): void;
}>();

const { canNavigateToStep, handleStepClick } = useStepIndicator(props, emit);
</script>

<style scoped src="./StepIndicator.css"></style>