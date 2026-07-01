<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

import { useWebVitals } from '../composition/useWebVitals'
import { useSessionStore } from '../stores/session'
import { useCategoriesStore } from '../stores/categories'
import { useSuppliersStore } from '../stores/suppliers'
import { useSubscriptionStore } from '../stores/subscription'

import UserMenu from './UserMenu.vue'
import LeftDrawer from './LeftDrawer.vue'

const NAME = process.env.NAME

const router = useRouter()
const quasar = useQuasar()
const { t } = useI18n()

const drawer = ref(false)
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const sessionStore = useSessionStore()
const categoriesStore = useCategoriesStore()
const suppliersStore = useSuppliersStore()
const subscriptionStore = useSubscriptionStore()

// Initialize Core Web Vitals tracking
useWebVitals()

const logout = () => {
  sessionStore.logout()
  router.push({ name: 'login' })
}

onMounted(async () => {
  if (!sessionStore.user) {
    const response = await sessionStore.fetchUserData().catch(logout)

    if (response?.code === 401) {
      logout()
    }
  }

  quasar.loading.show()

  const responses = await Promise.all([
    categoriesStore.getCategories(),
    suppliersStore.getSuppliers(),
    subscriptionStore.fetchStatus()
  ]).finally(() => quasar.loading.hide())

  if (responses.some((x) => x?.code === 401)) {
    logout()
  }
})
</script>

<template>
  <q-layout
    v-if="sessionStore.user"
    view="hHh LpR fFf"
  >
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="t('common.aria_menu')"
          @click="toggleDrawer"
        />
        <q-toolbar-title>{{ NAME }}</q-toolbar-title>

        <user-menu
          :user="sessionStore.user"
          @logout="logout"
        />
      </q-toolbar>
      <q-banner
        v-if="!subscriptionStore.hasActiveSubscription"
        class="bg-orange-3 text-orange-10 text-center q-pa-xs"
        dense
      >
        <div class="row items-center justify-center q-gutter-sm">
          <q-icon name="warning" size="xs" />
          <span class="text-caption">
            {{ t('common.subscription_required') }} —
            {{ t('common.subscription_required_detail') }}
          </span>
          <q-btn
            flat
            dense
            color="orange-10"
            :label="t('common.credit_manage')"
            :to="{ name: 'subscriptions view' }"
            size="xs"
          />
        </div>
      </q-banner>
    </q-header>

    <left-drawer v-model="drawer" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
