export interface GoogleIconEmits {
    (e: 'click'): void;
}

export const handleClickLogic = (emit: GoogleIconEmits): void => {
    emit('click');
};