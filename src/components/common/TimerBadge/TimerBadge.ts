import { ref, computed, watch, onUnmounted, readonly } from 'vue';
import { TIMER_INTERVAL_MS } from '@/utils/constants';

type EmitFunction = {
    (event: 'complete'): void;
    (event: 'tick', timeLeft: number): void;
};

export function useTimerBadge(
    props: { duration: number },
    emit: EmitFunction
) {
    const timeLeft = ref<number>(props.duration);
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    const formattedTime = computed(() => {
        const minutes = Math.floor(timeLeft.value / 60);
        const seconds = timeLeft.value % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });

    const stopTimer = (): void => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    const startTimer = (): void => {
        stopTimer();

        if (timeLeft.value <= 0) {
            emit('complete');
            return;
        }

        timerInterval = setInterval(() => {
            timeLeft.value--;
            emit('tick', timeLeft.value);

            if (timeLeft.value <= 0) {
                stopTimer();
                emit('complete');
            }
        }, TIMER_INTERVAL_MS);
    };

    const reset = (): void => {
        timeLeft.value = Math.max(0, props.duration);
        startTimer();
    };

    watch(
        () => props.duration,
        (newDuration) => {
            timeLeft.value = Math.max(0, newDuration);
            startTimer();
        },
        { immediate: true }
    );

    onUnmounted(stopTimer);

    return {
        reset,
        timeLeft: readonly(timeLeft),
        formattedTime,
    };
}