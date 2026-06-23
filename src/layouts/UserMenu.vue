<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSubscriptionStore } from '../stores/subscription'

defineProps<{ user: { name: string } }>()
defineEmits<{ logout: [void] }>()

const { t } = useI18n()
const subscriptionStore = useSubscriptionStore()
</script>

<template>
  <q-btn
    flat
    icon="account_box"
    :label="user.name"
    :ripple="false"
    :aria-label="t('common.aria_user')"
  >
    <q-menu class="q-pa-md">
      <div class="row">
        <p class="text-subtitle1 q-ma-md">
          {{ user.name }}
        </p>
      </div>

      <q-separator inset />

      <div class="q-pa-md subscription-info">
        <div v-if="subscriptionStore.hasActiveSubscription && subscriptionStore.subscription">
          <div class="text-caption text-grey">
            {{ t('common.subscription_plan') }}
          </div>
          <div class="text-body2 text-weight-bold">
            {{ subscriptionStore.planLabel }}
          </div>
          <div class="text-caption text-grey q-mt-sm">
            {{ t('common.subscription_until') }}
          </div>
          <div class="text-body2">
            {{ new Date(subscriptionStore.subscription.ends_at).toLocaleDateString() }}
          </div>
          <div class="text-caption text-grey q-mt-sm">
            {{ t('common.subscription_days_remaining', { days: subscriptionStore.daysRemaining }) }}
          </div>
        </div>
        <div v-else>
          <div class="text-caption text-grey">
            {{ t('common.subscription_no_active') }}
          </div>
        </div>
      </div>

      <q-separator inset />

      <q-list
        class="q-mt"
        style="min-width: 100px"
      >
        <q-item
          v-close-popup
          clickable
          @click="$emit('logout')"
        >
          <q-item-section>{{ t('common.logout') }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style scoped>
.subscription-info {
  min-width: 200px;
}
</style>
