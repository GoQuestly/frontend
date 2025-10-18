import { ref, computed, watch, onUnmounted } from 'vue';

export interface TimerBadgeOptions {
    duration: number;
    emit: {
        (event: 'complete'): void;
        (event: 'tick', timeLeft: number): void;
    };
}

export function useTimerBadge(props: { duration: number }, emit: TimerBadgeOptions['emit']) {
    const timeLeft = ref<number>(props.duration);
    let timerInterval: number | null = null;

    const formattedTime = computed(() => {
        const minutes = Math.floor(timeLeft.value / 60);
        const seconds = timeLeft.value % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    const startTimer = (): void => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        if (timeLeft.value === 0) {
            emit('complete');
            return;
        }

        timerInterval = setInterval(() => {
            if (timeLeft.value > 0) {
                timeLeft.value--;
                emit('tick', timeLeft.value);

                if (timeLeft.value === 0) {
                    if (timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                    }
                    emit('complete');
                }
            }
        }, 1000);
    };

    const reset = (): void => {
        timeLeft.value = props.duration;
        startTimer();
    };

    watch(() => props.duration, (newDuration) => {
        timeLeft.value = newDuration;
        startTimer();
    }, { immediate: true });

    onUnmounted(() => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });

    return {
        reset,
        timeLeft: computed(() => timeLeft.value),
        formattedTime,
    };
}