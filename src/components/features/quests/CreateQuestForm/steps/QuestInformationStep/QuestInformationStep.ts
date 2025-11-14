import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QuestFormData } from '@/types/form';
import { createStartingPointCheckpoint } from '@/utils/checkpoints';

interface Props {
    modelValue: QuestFormData;
    questId?: number | null;
    existingPhotoUrl?: string;
}

interface Emit {
    (e: 'update:modelValue', value: QuestFormData): void;
    (e: 'cover-image-change', file: File | null): void;
}

export const useQuestInformationStep = (props: Props, emit: Emit) => {
    const { t } = useI18n();

    const localData = reactive({
        title: props.modelValue.title || '',
        description: props.modelValue.description || '',
        publicProgressVisibility: props.modelValue.publicProgressVisibility ?? true,
        minParticipants: props.modelValue.minParticipants || 0,
        maxParticipants: props.modelValue.maxParticipants || 0,
        maxDuration: props.modelValue.maxDuration || 0,
        startingLat: props.modelValue.startingLat || 50.4501,
        startingLng: props.modelValue.startingLng || 30.5234,
        startRadius: props.modelValue.startRadius || 0,
    });

    const formRef = ref<HTMLFormElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const coverImageFile = ref<File | null>(null);
    const coverImagePreview = ref<string>('');

    const errorKeys = reactive({
        coverImage: '',
        minParticipants: '',
        maxParticipants: '',
        participantsLimit: '',
        maxDuration: '',
        startRadius: '',
    });

    const applyExistingPhoto = (url?: string | null): void => {
        if (url) {
            coverImageFile.value = null;
            coverImagePreview.value = url;
        } else if (!coverImageFile.value) {
            coverImagePreview.value = '';
        }
    };

    const errors = computed(() => ({
        coverImage: errorKeys.coverImage ? t(errorKeys.coverImage) : '',
        minParticipants: errorKeys.minParticipants ? t(errorKeys.minParticipants) : '',
        maxParticipants: errorKeys.maxParticipants ? t(errorKeys.maxParticipants) : '',
        participantsLimit: errorKeys.participantsLimit ? t(errorKeys.participantsLimit) : '',
        maxDuration: errorKeys.maxDuration ? t(errorKeys.maxDuration) : '',
        startRadius: errorKeys.startRadius ? t(errorKeys.startRadius) : '',
    }));

    onMounted(() => {
        applyExistingPhoto(props.existingPhotoUrl);
    });

    watch(() => props.modelValue, (newValue) => {
        Object.assign(localData, {
            title: newValue.title || '',
            description: newValue.description || '',
            publicProgressVisibility: newValue.publicProgressVisibility ?? true,
            minParticipants: newValue.minParticipants || 0,
            maxParticipants: newValue.maxParticipants || 0,
            maxDuration: newValue.maxDuration || 0,
            startingLat: newValue.startingLat || 50.4501,
            startingLng: newValue.startingLng || 30.5234,
            startRadius: newValue.startRadius || 0,
        });
    }, { deep: true });

    watch(() => props.existingPhotoUrl, (newUrl) => {
        applyExistingPhoto(newUrl);
    });

    const startingPointCheckpoint = computed(() =>
        createStartingPointCheckpoint(localData.startingLat, localData.startingLng),
    );

    const updateField = (field: keyof typeof localData, value: any): void => {
        (localData as any)[field] = value;

        if (field in errorKeys) {
            (errorKeys as any)[field] = '';
        }

        emit('update:modelValue', {
            ...props.modelValue,
            ...localData,
        });
    };

    const handleNumberInput = (field: keyof typeof localData, value: string): void => {
        const numValue = value === '' ? 0 : Number(value);
        updateField(field, numValue);
    };

    const triggerFileInput = (): void => {
        fileInputRef.value?.click();
    };

    const handleFileSelect = (event: Event): void => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (event: DragEvent): void => {
        const file = event.dataTransfer?.files[0];

        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File): void => {
        errorKeys.coverImage = '';

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        const maxSize = 10 * 1024 * 1024; 

        if (!allowedTypes.includes(file.type)) {
            errorKeys.coverImage = 'quests.createQuest.step1.errors.invalidFileType';
            return;
        }

        if (file.size > maxSize) {
            errorKeys.coverImage = 'quests.createQuest.step1.errors.fileTooLarge';
            return;
        }

        coverImageFile.value = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            coverImagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);

        emit('cover-image-change', file);
    };

    const removeCoverImage = (): void => {
        coverImageFile.value = null;
        coverImagePreview.value = '';
        errorKeys.coverImage = '';

        if (fileInputRef.value) {
            fileInputRef.value.value = '';
        }

        emit('cover-image-change', null);
    };

    const updateStartingCoordinates = (id: string, lat: number, lng: number): void => {
        if (id === 'starting-point') {
            localData.startingLat = lat;
            localData.startingLng = lng;

            emit('update:modelValue', {
                ...props.modelValue,
                ...localData,
            });
        }
    };

    const validate = (): boolean => {
        errorKeys.coverImage = '';
        errorKeys.minParticipants = '';
        errorKeys.maxParticipants = '';
        errorKeys.participantsLimit = '';
        errorKeys.maxDuration = '';
        errorKeys.startRadius = '';

        let isValid = true;

        if (formRef.value && !formRef.value.checkValidity()) {
            formRef.value.reportValidity();
            return false;
        }

        if (localData.minParticipants < 1) {
            errorKeys.minParticipants = 'quests.createQuest.step1.errors.minParticipantsMin';
            isValid = false;
        }

        if (localData.maxParticipants < 1) {
            errorKeys.maxParticipants = 'quests.createQuest.step1.errors.maxParticipantsMin';
            isValid = false;
        }

        if (localData.maxParticipants > 100) {
            const limitErrorKey = 'quests.createQuest.step1.errors.maxParticipantsMax';
            errorKeys.participantsLimit = limitErrorKey;
            errorKeys.maxParticipants = '';
            errorKeys.minParticipants = '';
            isValid = false;
        }

        if (localData.minParticipants > localData.maxParticipants) {
            errorKeys.maxParticipants = 'quests.createQuest.step1.errors.maxParticipantsGreaterThanMin';
            isValid = false;
        }

        if (localData.maxDuration < 10) {
            errorKeys.maxDuration = 'quests.createQuest.step1.errors.maxDurationMin';
            isValid = false;
        }

        if (localData.maxDuration > 1440) {
            errorKeys.maxDuration = 'quests.createQuest.step1.errors.maxDurationMax';
            isValid = false;
        }

        if (localData.startRadius < 20) {
            errorKeys.startRadius = 'quests.createQuest.step1.errors.startRadiusMin';
            isValid = false;
        }

        if (localData.startRadius > 10000) {
            errorKeys.startRadius = 'quests.createQuest.step1.errors.startRadiusMax';
            isValid = false;
        }

        return isValid;
    };

    return {
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
    };
};


