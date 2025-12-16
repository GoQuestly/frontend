import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QuestFormData } from '@/types/form';
import { createStartingPointCheckpoint } from '@/utils/checkpoints';
import { getDefaultCoordinates } from '@/utils/geolocation';

interface Props {
    modelValue: QuestFormData;
    questId?: number | null;
    existingPhotoUrl?: string;
    existingCoverFile?: File | null;
}

type QuestInformationFields = Pick<QuestFormData,
    'title' |
    'description' |
    'minParticipants' |
    'maxParticipants' |
    'maxDuration' |
    'startingLat' |
    'startingLng' |
    'startRadius'
>;

interface Emit {
    (e: 'cover-image-change', file: File | null): void;
}

export const useQuestInformationStep = (props: Props, emit: Emit) => {
    const { t } = useI18n();

    const defaultCoords = getDefaultCoordinates();

    const localData = reactive({
        title: '',
        description: '',
        minParticipants: 0,
        maxParticipants: 0,
        maxDuration: 0,
        startingLat: defaultCoords.lat,
        startingLng: defaultCoords.lng,
        startRadius: 0,
    });

    const syncLocalData = (model: QuestFormData): void => {
        localData.title = model.title || '';
        localData.description = model.description || '';
        localData.minParticipants = model.minParticipants || 0;
        localData.maxParticipants = model.maxParticipants || 0;
        localData.maxDuration = model.maxDuration || 0;
        localData.startingLat = model.startingLat || defaultCoords.lat;
        localData.startingLng = model.startingLng || defaultCoords.lng;
        localData.startRadius = model.startRadius || 0;
    };

    syncLocalData(props.modelValue);

    const formRef = ref<HTMLFormElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const coverImageFile = ref<File | null>(null);
    const coverImagePreview = ref<string>('');
    const imageLoadError = ref<boolean>(false);

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
            imageLoadError.value = false;
        } else if (!coverImageFile.value) {
            coverImagePreview.value = '';
            imageLoadError.value = false;
        }
    };

    const handleImageError = (): void => {
        imageLoadError.value = true;
    };

    const errors = computed(() => ({
        coverImage: errorKeys.coverImage ? t(errorKeys.coverImage) : '',
        minParticipants: '',
        maxParticipants: '',
        participantsLimit: '',
        maxDuration: '',
        startRadius: '',
    }));

    onMounted(() => {
        if (props.existingCoverFile) {
            coverImageFile.value = props.existingCoverFile;
            coverImagePreview.value = URL.createObjectURL(props.existingCoverFile);
        } else {
            applyExistingPhoto(props.existingPhotoUrl);
        }
    });

    watch(() => props.modelValue, (newValue) => {
        syncLocalData(newValue);
    }, { deep: true });

    watch(() => props.existingPhotoUrl, (newUrl) => {
        if (!coverImageFile.value && !props.existingCoverFile) {
            applyExistingPhoto(newUrl);
        }
    });

    watch(() => props.existingCoverFile, (newFile) => {
        if (newFile && newFile !== coverImageFile.value) {
            coverImageFile.value = newFile;
            coverImagePreview.value = URL.createObjectURL(newFile);
        }
    });

    const startingPointCheckpoint = computed(() =>
        createStartingPointCheckpoint(localData.startingLat, localData.startingLng),
    );

    const updateField = (field: keyof typeof localData, value: any): void => {
        (localData as any)[field] = value;

        if (field in errorKeys) {
            (errorKeys as any)[field] = '';
        }
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

        if (fileInputRef.value) {
            fileInputRef.value.value = '';
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
        imageLoadError.value = false;

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
        coverImagePreview.value = URL.createObjectURL(file);

        emit('cover-image-change', file);
    };

    const removeCoverImage = (): void => {
        coverImageFile.value = null;
        coverImagePreview.value = '';
        errorKeys.coverImage = '';
        imageLoadError.value = false;

        if (fileInputRef.value) {
            fileInputRef.value.value = '';
        }

        emit('cover-image-change', null);
    };

    const updateStartingCoordinates = (id: string, lat: number, lng: number): void => {
        if (id === 'starting-point') {
            localData.startingLat = lat;
            localData.startingLng = lng;
        }
    };

    const validate = (): boolean => {
        errorKeys.coverImage = '';

        if (formRef.value && !formRef.value.checkValidity()) {
            formRef.value.reportValidity();
            return false;
        }

        return true;
    };

    const resetToModelValue = (): void => {
        syncLocalData(props.modelValue);
        applyExistingPhoto(props.existingPhotoUrl);
        if (fileInputRef.value) {
            fileInputRef.value.value = '';
        }
    };

    return {
        localData,
        formRef,
        fileInputRef,
        coverImageFile,
        coverImagePreview,
        imageLoadError,
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
        applyExistingPhoto,
        handleImageError,
        getFormValues: (): QuestInformationFields => ({ ...localData }),
        resetToModelValue,
    };
};
