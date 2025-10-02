<template>
  <div style="width:100%">
    <div class="fields">
      <!-- Метка -->
      <input
        type="text"
        v-model="labelInput"
        placeholder="Метка (через ;)"
        :class="{'input-error': account?.errors?.labelInput}"
        @blur="onBlur('labelInput')"
        title="Метка — необязательное поле. Максимум 50 символов."
      />

      <!-- Тип -->
      <select v-model="type" @change="onTypeChange" title="Выберите тип. Для LDAP пароль сохраняется как null.">
        <option value="ldap">LDAP</option>
        <option value="local">Локальная</option>
      </select>

      <!-- Логин -->
      <input
        type="text"
        v-model="login"
        placeholder="Логин"
        :class="{'input-error': account?.errors?.login}"
        @blur="onBlur('login')"
        title="Логин обязателен. Максимум 100 символов."
      />

      <!-- Пароль -->
      <template v-if="type === 'local'">
        <input
          type="password"
          v-model="password"
          placeholder="Пароль"
          :class="{'input-error': account?.errors?.password}"
          @blur="onBlur('password')"
          title="Пароль обязателен для локальной записи. Максимум 100 символов."
        />
      </template>
      <template v-else>
        <input type="text" disabled value="(пароль скрыт)" title="Пароль скрыт для LDAP (сохраняется как null)" />
      </template>

      <!-- Удаление -->
      <button class="delete-btn" @click="remove" title="Удалить">✕</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import type { Account } from '../stores/accounts'

const props = defineProps<{ id: string }>()
const store = useAccountsStore()

const account = computed(() => store.accounts.find(a => a.id === props.id) as Account | undefined)

const labelInput = ref(account.value?.labelInput ?? '')
const login = ref(account.value?.login ?? '')
const password = ref(account.value?.password ?? '')
const type = ref(account.value?.type ?? 'ldap')

watch(account, (newVal) => {
  if (!newVal) return
  labelInput.value = newVal.labelInput
  login.value = newVal.login
  password.value = newVal.password ?? ''
  type.value = newVal.type
})

function onBlur(field: 'labelInput' | 'login' | 'password') {
  if (!account.value) return
  if (field === 'labelInput') store.updateAccountField(account.value.id, 'labelInput', labelInput.value)
  else if (field === 'login') store.updateAccountField(account.value.id, 'login', login.value)
  else if (field === 'password') store.updateAccountField(account.value.id, 'password', password.value)
}

function onTypeChange() {
  if (!account.value) return
  store.updateAccountField(account.value.id, 'type', type.value)
}

function remove() {
  if (!account.value) return
  store.removeAccount(account.value.id)
}
</script>
