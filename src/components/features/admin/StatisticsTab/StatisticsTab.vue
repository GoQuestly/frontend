<template>
  <div class="statistics-tab">
    <div class="statistics-header">
      <h2 class="section-title">{{ $t('admin.statistics.title') }}</h2>

      <div class="period-selector">
        <label class="period-label">{{ $t('admin.statistics.period') }}:</label>
        <select v-model="selectedPeriod" class="period-select">
          <option value="day">{{ $t('admin.statistics.periods.day') }}</option>
          <option value="week">{{ $t('admin.statistics.periods.week') }}</option>
          <option value="month">{{ $t('admin.statistics.periods.month') }}</option>
          <option value="all-time">{{ $t('admin.statistics.periods.allTime') }}</option>
        </select>

        <span v-if="statistics && selectedPeriod !== 'all-time'" class="period-range">
          {{ formatPeriod(statistics.period) }}
        </span>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="statistics" class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.totalUsers') }}</h3>
          <p class="stat-value">{{ statistics.metrics.totalUsers }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87m-3-12a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.newUsers') }}</h3>
          <p class="stat-value">{{ statistics.metrics.newUsers }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.totalQuests') }}</h3>
          <p class="stat-value">{{ statistics.metrics.totalQuests }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.totalSessions') }}</h3>
          <p class="stat-value">{{ statistics.metrics.totalSessions }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.completedSessions') }}</h3>
          <p class="stat-value">{{ statistics.metrics.completedSessions }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.completionRate') }}</h3>
          <p class="stat-value">{{ statistics.metrics.completionRate.toFixed(1) }}%</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.activeUsers') }}</h3>
          <p class="stat-value">{{ statistics.metrics.activeUsers }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ $t('admin.statistics.activeSessions') }}</h3>
          <p class="stat-value">{{ statistics.metrics.activeSessions }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStatistics } from './StatisticsTab';

const {
  selectedPeriod,
  isLoading,
  statistics,
  formatPeriod,
} = useStatistics();
</script>

<style scoped src="./StatisticsTab.css"></style>
