<template>
  <div class="accounts-list">
    <div v-if="accounts.length === 0" class="empty">
      Список пуст. Нажмите «+ Добавить», чтобы создать новую учетную запись.
    </div>

    <div v-for="acc in accounts" :key="acc.id" class="card">
      <AccountItem :id="acc.id" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import AccountItem from './AccountItem.vue'

const store = useAccountsStore()
const accounts = computed(() => store.accounts)
</script>
