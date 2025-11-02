<template>
  <div class="search-input-wrapper">
    <img src="@/assets/images/search-icon.png" alt="Search" class="search-icon" />
    <input
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        class="search-input"
        @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { searchInputDefaults, handleInputChange } from './SearchInput';
import type { SearchInputProps, SearchInputEmits } from './SearchInput';
import './SearchInput.css';

const { modelValue, placeholder } = withDefaults(defineProps<SearchInputProps>(), searchInputDefaults);
const emit = defineEmits<SearchInputEmits>();

const handleInput = (event: Event) => {
  handleInputChange(event, emit);
};
</script>