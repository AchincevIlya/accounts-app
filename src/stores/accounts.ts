import { defineStore } from 'pinia'
import { ref } from 'vue'

type AccountType = 'ldap' | 'local'

export interface LabelObj { text: string }

export interface Account {
  id: string;
  labelInput: string;      // input как строка, через ';'
  labels: LabelObj[];      // сохранённые метки [{text:..}, ...]
  type: AccountType;
  login: string;
  password: string | null;
  errors: Partial<Record<'labelInput'|'login'|'password', string>>;
}

const STORAGE_KEY = 'vue-accounts-v1'

function uid() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  function parseLabels(input: string): LabelObj[] {
    if (!input) return []
    return input.split(';').map(s => s.trim()).filter(Boolean).map(text => ({ text }))
  }


  function addAccount() {
    accounts.value.push({
      id: uid(),
      labelInput: '',
      labels: [],
      type: 'ldap',       // по-умолчанию LDAP (пароль скрыт)
      login: '',
      password: null,
      errors: {}
    })
  }

  function removeAccount(id: string) {
    const idx = accounts.value.findIndex(a => a.id === id)
    if (idx >= 0) {
      accounts.value.splice(idx, 1)
    }
    // пересохраняем (в localStorage остаются только валидные записи)
    saveToStorage()
  }

  function validateAccount(acc: Account): Partial<Record<'labelInput'|'login'|'password', string>> {
    const errors: Partial<Record<'labelInput'|'login'|'password', string>> = {}

    // Метка — необязательное поле, но длина поля <= 50
    if (acc.labelInput && acc.labelInput.length > 50) {
      errors.labelInput = 'Максимум 50 символов'
    }

    // Логин — обязательное, максимум 100
    if (!acc.login || !acc.login.trim()) {
      errors.login = 'Обязательное поле'
    } else if (acc.login.length > 100) {
      errors.login = 'Максимум 100 символов'
    }

    // Пароль — обязателен только для типа 'local'
    if (acc.type === 'local') {
      if (!acc.password || !acc.password.toString().trim()) {
        errors.password = 'Обязательное поле'
      } else if ((acc.password ?? '').length > 100) {
        errors.password = 'Максимум 100 символов'
      }
    } else {
      // для ldap пароль должен быть null
      acc.password = null
    }

    acc.errors = errors
    // Если валидно — обновляем labels (массив объектов)
    if (Object.keys(errors).length === 0) {
      acc.labels = parseLabels(acc.labelInput)
    }
    return errors
  }

  function isAccountValid(acc: Account) {
    return !acc.errors || Object.keys(acc.errors).length === 0
  }

  // Обновление поля (вызов при blur / change)
  function updateAccountField(id: string, field: keyof Account, value: any) {
    const acc = accounts.value.find(a => a.id === id)
    if (!acc) return
    if (field === 'labelInput') acc.labelInput = value
    else if (field === 'login') acc.login = value
    else if (field === 'password') acc.password = value
    else if (field === 'type') {
      acc.type = value
      if (value === 'ldap') acc.password = null
    }
    validateAccount(acc)
    // Сохраняем в localStorage только валидные аккаунты
    saveToStorage()
  }

  function saveToStorage() {
    try {
      // сохраняем только валидные записи
      const persistable = accounts.value
        .filter(a => isAccountValid(a))
        .map(a => ({
          id: a.id,
          labels: a.labels,
          type: a.type,
          login: a.login,
          password: a.password
        }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
    } catch (e) {
      console.error('Ошибка сохранения аккаунтов:', e)
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Array<any>
      accounts.value = parsed.map(p => ({
        id: p.id ?? uid(),
        labels: p.labels ?? [],
        labelInput: Array.isArray(p.labels) ? p.labels.map((l:any) => l.text).join(';') : '',
        type: p.type === 'local' ? 'local' : 'ldap',
        login: p.login ?? '',
        password: p.type === 'ldap' ? null : (p.password ?? null),
        errors: {}
      }))
    } catch (e) {
      console.error('Ошибка загрузки аккаунтов из localStorage', e)
    }
  }

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccountField,
    validateAccount,
    loadFromStorage
  }
})
