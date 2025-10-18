import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark';

export function useTheme() {
    const isDark = ref<boolean>(false);

    onMounted(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        isDark.value = savedTheme === 'dark';
        applyTheme();
    });

    const applyTheme = (): void => {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = (): void => {
        isDark.value = !isDark.value;
        const theme: Theme = isDark.value ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyTheme();
    };

    watch(isDark, applyTheme);

    return {
        isDark,
        toggleTheme
    };
}