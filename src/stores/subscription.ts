import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { differenceInCalendarDays } from 'date-fns'

import { subscriptionService } from '../services/Subscription'
import type { SubscriptionData } from '../services/Subscription'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<SubscriptionData | null>(null)
  const hasActiveSubscription = ref(false)
  const loading = ref(false)

  const planLabel = computed(() => {
    if (!subscription.value?.plan) return ''
    const labels: Record<string, string> = {
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    }
    return labels[subscription.value.plan] ?? subscription.value.plan
  })

  const daysRemaining = computed(() => {
    if (!hasActiveSubscription.value || !subscription.value?.ends_at) return null
    const endsAt = new Date(subscription.value.ends_at)
    endsAt.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = differenceInCalendarDays(endsAt, today)
    return days >= 0 ? days : 0
  })

  async function fetchStatus () {
    loading.value = true
    const response = await subscriptionService.getStatus()
    if (response.isOk && response.data) {
      hasActiveSubscription.value = response.data.has_active_subscription
      subscription.value = response.data.subscription
    }
    loading.value = false
    return response
  }

  return {
    subscription,
    hasActiveSubscription,
    loading,
    planLabel,
    daysRemaining,
    fetchStatus
  }
})
