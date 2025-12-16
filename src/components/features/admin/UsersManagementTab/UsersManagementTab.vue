<template>
  <div class="users-management-tab">
    <div class="users-header">
      <h2 class="section-title">{{ $t('admin.users.title') }}</h2>

      <div class="controls">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('admin.users.searchPlaceholder')"
            class="search-input"
          />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>{{ $t('admin.users.columns.photo') }}</th>
            <th @click="handleSort('name')" class="sortable">
              {{ $t('admin.users.columns.name') }}
              <span class="sort-icon">{{ getSortIcon('name') }}</span>
            </th>
            <th>{{ $t('admin.users.columns.email') }}</th>
            <th>{{ $t('admin.users.columns.verified') }}</th>
            <th>{{ $t('admin.users.columns.quests') }}</th>
            <th>{{ $t('admin.users.columns.sessions') }}</th>
            <th>{{ $t('admin.users.columns.status') }}</th>
            <th>{{ $t('admin.users.columns.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userId">
            <td>
              <img
                v-if="user.photoUrl"
                :src="user.photoUrl"
                :alt="user.name"
                class="user-photo"
              />
              <div v-else class="user-photo-placeholder">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
            </td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.isEmailVerified ? 'badge-success' : 'badge-warning'">
                {{ user.isEmailVerified ? $t('admin.users.verified') : $t('admin.users.unverified') }}
              </span>
            </td>
            <td>{{ user.questCount }}</td>
            <td>{{ user.sessionCount }}</td>
            <td>
              <span class="badge" :class="user.isBanned ? 'badge-danger' : 'badge-success'">
                {{ user.isBanned ? $t('admin.users.banned') : $t('admin.users.active') }}
              </span>
            </td>
            <td>
              <BaseButton
                :variant="user.isBanned ? 'primary' : 'secondary'"
                size="small"
                @click="toggleBan(user.userId, user.isBanned)"
              >
                {{ user.isBanned ? $t('admin.users.actions.unban') : $t('admin.users.actions.ban') }}
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="empty-state">
        <p>{{ $t('admin.users.noUsers') }}</p>
      </div>

      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import Pagination from '@/components/common/Pagination/Pagination.vue';
import { useUsersManagement } from './UsersManagementTab';

const {
  searchQuery,
  currentPage,
  totalPages,
  isLoading,
  users,
  handleSort,
  getSortIcon,
  toggleBan,
  handlePageChange,
} = useUsersManagement();
</script>

<style scoped src="./UsersManagementTab.css"></style>
