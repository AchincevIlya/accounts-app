<template>
  <div class="container">
    <div class="header">
      <h1>Управление учетными записями</h1>
      <button class="add-btn" @click="addAccount">+ Добавить</button>
    </div>

    <AccountsList />
  </div>
</template>

<script lang="ts" setup>
import AccountsList from './components/AccountsList.vue'
import { useAccountsStore } from './stores/accounts.ts'

const store = useAccountsStore()
function addAccount() {
  store.addAccount()
}
</script>
