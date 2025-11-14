import { reactive, watch } from 'vue';
import type { Question } from '@/types/task';

export interface Props {
    modelValue: Question[];
}

export interface Emits {
    (e: 'update:modelValue', questions: Question[]): void;
}

export function useQuizQuestions(props: Props, emit: Emits) {
    const localQuestions = reactive<Question[]>([...props.modelValue]);

    watch(() => props.modelValue, (newQuestions) => {
        localQuestions.splice(0, localQuestions.length, ...newQuestions);
    }, { deep: true });

    const addQuestion = (): void => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            points: '50',
            options: [
                { id: '1', text: '', isCorrect: false },
                { id: '2', text: '', isCorrect: false },
            ],
        };

        localQuestions.push(newQuestion);
        emitUpdate();
    };

    const deleteQuestion = (questionId: string): void => {
        const index = localQuestions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            localQuestions.splice(index, 1);
            emitUpdate();
        }
    };

    const selectCorrectAnswer = (questionId: string, optionId: string): void => {
        const question = localQuestions.find(q => q.id === questionId);
        if (!question) return;

        question.options.forEach(option => {
            option.isCorrect = option.id === optionId;
        });

        emitUpdate();
    };

    const emitUpdate = (): void => {
        emit('update:modelValue', [...localQuestions]);
    };

    return {
        localQuestions,
        addQuestion,
        deleteQuestion,
        selectCorrectAnswer,
        emitUpdate,
    };
}
