<template>
  <div class="pagination">
    <BaseButton
        variant="secondary"
        :disabled="!canGoPrevious(currentPage)"
        @click="handlePrevious"
        class="pagination-button pagination-arrow"
    >
      ‹
    </BaseButton>

    <template v-for="(page, index) in displayPages" :key="index">
      <BaseButton
          v-if="typeof page === 'string' && page.startsWith('ellipsis')"
          variant="secondary"
          @click="handleEllipsis(page)"
          class="pagination-button pagination-ellipsis-button"
          :title="page === 'ellipsis-forward' ? 'Forward 3 pages' : 'Back 3 pages'"
      >
        ...
      </BaseButton>
      <BaseButton
          v-else
          variant="secondary"
          :class="{ active: page === currentPage }"
          @click="handlePage(page as number)"
          class="pagination-button"
      >
        {{ page }}
      </BaseButton>
    </template>

    <BaseButton
        variant="secondary"
        :disabled="!canGoNext(currentPage, totalPages)"
        @click="handleNext"
        class="pagination-button pagination-arrow"
    >
      ›
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import {
  canGoPrevious,
  canGoNext,
  handlePreviousPage,
  handleNextPage,
  handlePageClick,
  handleEllipsisClick,
  generatePageNumbers,
} from './Pagination';
import type { PaginationProps, PaginationEmits } from './Pagination';
import './Pagination.css';

const { currentPage, totalPages } = defineProps<PaginationProps>();
const emit = defineEmits<PaginationEmits>();

const displayPages = computed(() => generatePageNumbers(currentPage, totalPages));

const handlePrevious = () => {
  handlePreviousPage(currentPage, emit);
};

const handleNext = () => {
  handleNextPage(currentPage, totalPages, emit);
};

const handlePage = (page: number) => {
  handlePageClick(page, emit);
};

const handleEllipsis = (ellipsisType: string) => {
  const direction = ellipsisType === 'ellipsis-forward' ? 'forward' : 'backward';
  handleEllipsisClick(direction, currentPage, totalPages, emit);
};
</script>