<template>
  <div class="timer-badge">
    {{ formattedTime }}
  </div>
</template>

<script setup lang="ts">
import { useTimerBadge } from './TimerBadge';
import './TimerBadge.css';

interface Props {
  duration: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 0,
});

const emit = defineEmits<{
  complete: [];
  tick: [timeLeft: number];
}>();

const { reset, timeLeft, formattedTime } = useTimerBadge(props, emit);

defineExpose({
  reset,
  timeLeft,
});
</script>

<style scoped src="./TimerBadge.css"></style>