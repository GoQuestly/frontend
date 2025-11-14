interface Step {
    number: number;
    label: string;
}

interface Props {
    currentStep: number;
    steps: Step[];
    questId: number | null;
}

interface Emit {
    (e: 'step-click', step: number): void;
}

export const useStepIndicator = (props: Props, emit: Emit) => {

    const canNavigateToStep = (stepNumber: number): boolean => {
        if (!props.questId) {
            return stepNumber === 1;
        }
        return true;
    };

    const handleStepClick = (stepNumber: number): void => {
        if (!canNavigateToStep(stepNumber)) {
            return;
        }

        emit('step-click', stepNumber);
    };

    return {
        canNavigateToStep,
        handleStepClick,
    };
};