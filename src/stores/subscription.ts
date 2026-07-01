import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { subscriptionService } from '../services/Subscription'
import type { SubscriptionData } from '../services/Subscription'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<SubscriptionData | null>(null)
  const hasActiveSubscription = ref(false)
  const daysRemaining = ref<number | null>(null)
  const loading = ref(false)

  const planLabel = computed(() => {
    if (!subscription.value?.plan) return ''
    const labels: Record<string, string> = {
      monthly: '30 días',
      quarterly: '90 días',
      yearly: '365 días'
    }
    return labels[subscription.value.plan] ?? subscription.value.plan
  })

  async function fetchStatus () {
    loading.value = true
    const response = await subscriptionService.getStatus()
    if (response.isOk && response.data) {
      hasActiveSubscription.value = response.data.has_active_subscription
      subscription.value = response.data.subscription
      daysRemaining.value = response.data.days_remaining
    }
    loading.value = false
    return response
  }

  return {
    subscription,
    hasActiveSubscription,
    daysRemaining,
    loading,
    planLabel,
    fetchStatus
  }
})