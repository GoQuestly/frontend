export interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export interface PaginationEmits {
    (e: 'page-change', page: number): void;
}

export const canGoPrevious = (currentPage: number): boolean => {
    return currentPage > 1;
};

export const canGoNext = (currentPage: number, totalPages: number): boolean => {
    return currentPage < totalPages;
};

export const handlePreviousPage = (
    currentPage: number,
    emit: PaginationEmits
): void => {
    if (canGoPrevious(currentPage)) {
        emit('page-change', currentPage - 1);
    }
};

export const handleNextPage = (
    currentPage: number,
    totalPages: number,
    emit: PaginationEmits
): void => {
    if (canGoNext(currentPage, totalPages)) {
        emit('page-change', currentPage + 1);
    }
};

export const handlePageClick = (
    page: number,
    emit: PaginationEmits
): void => {
    emit('page-change', page);
};

export const handleEllipsisClick = (
    direction: 'forward' | 'backward',
    currentPage: number,
    totalPages: number,
    emit: PaginationEmits
): void => {
    let newPage: number;

    if (direction === 'forward') {
        newPage = Math.min(currentPage + 3, totalPages);
    } else {
        newPage = Math.max(currentPage - 3, 1);
    }

    emit('page-change', newPage);
};

export const generatePageNumbers = (
    currentPage: number,
    totalPages: number
): (number | string)[] => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    pages.push(1);

    if (currentPage <= 3) {
        pages.push(2, 3, 4, 'ellipsis-forward', totalPages);
    } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis-backward', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push('ellipsis-backward', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-forward', totalPages);
    }

    return pages;
};