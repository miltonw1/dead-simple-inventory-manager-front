<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRequests } from '../../composition/useRequests'
import { subscriptionService } from 'src/services/Subscription'
import { useSubscriptionStore } from 'src/stores/subscription'
import type { PlanData } from 'src/services/Subscription'

const route = useRoute()
const quasar = useQuasar()
const { t } = useI18n()
const { request } = useRequests()
const subscriptionStore = useSubscriptionStore()

const loadingPlan = ref<string | null>(null)
const processingPayment = ref(false)
const plans = ref<PlanData[]>([])

let pollTimer: ReturnType<typeof setInterval> | null = null

async function subscribe (plan: 'monthly' | 'quarterly' | 'yearly') {
  try {
    loadingPlan.value = plan

    const response = await request(
      subscriptionService.createCheckout(plan)
    )

    const checkoutUrl = response.data?.checkout_url

    if (!checkoutUrl) {
      throw new Error('No checkout URL')
    }

    window.location.href = checkoutUrl
  } catch (err) {
    console.error(err)

    quasar.notify({
      color: 'negative',
      message: 'No se pudo iniciar el pago'
    })
  } finally {
    loadingPlan.value = null
  }
}

function formatPrice (amount: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

async function verifyAndPoll (attempts = 0) {
  const maxAttempts = 12
  if (attempts >= maxAttempts) {
    processingPayment.value = false
    quasar.notify({
      color: 'warning',
      message: 'No se pudo verificar el pago automáticamente. Recargá la página o intentá de nuevo.'
    })
    return
  }

  const response = await request(subscriptionService.verifyPending())

  if (response.isOk && response.data?.verified) {
    await subscriptionStore.fetchStatus()
    processingPayment.value = false
    quasar.notify({
      color: 'positive',
      message: 'Pago recibido. Tus días de acceso se han actualizado.'
    })
    return
  }

  pollTimer = setTimeout(() => verifyAndPoll(attempts + 1), 3000)
}

onMounted(async () => {
  await subscriptionStore.fetchStatus()

  const plansResponse = await request(subscriptionService.getPlans())
  if (plansResponse.isOk && plansResponse.data) {
    plans.value = plansResponse.data
  }

  if (route.query.status === 'approved' || route.query.collection_status === 'approved' || route.query.payment === 'approved') {
    processingPayment.value = true
    quasar.notify({
      color: 'positive',
      message: 'Pago recibido. Estamos actualizando tus días de acceso...',
      timeout: 2000
    })
    verifyAndPoll()
  } else if (subscriptionStore.subscription?.status === 'pending') {
    processingPayment.value = true
    verifyAndPoll()
  }
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
})
</script>

<template>
  <q-page class="q-pa-lg">
    <div class="text-center q-mb-xl">
      <div class="text-h4">
        {{ t('common.credit_manage') }}
      </div>
    </div>

    <div
      v-if="processingPayment"
      class="q-mb-xl"
    >
      <q-card class="current-plan-card shadow-4">
        <q-card-section class="bg-warning text-center">
          <q-spinner
            color="white"
            size="2em"
            class="q-mr-sm"
          />
          <span class="text-h6 text-white">Procesando pago...</span>
          <div class="text-caption text-white q-mt-sm">
            Estamos verificando tu pago. Esto puede tomar unos segundos.
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div
      v-if="subscriptionStore.hasActiveSubscription && subscriptionStore.subscription"
      class="q-mb-xl"
    >
      <q-card class="current-plan-card shadow-4">
        <q-card-section class="bg-positive text-white">
          <div class="text-h5 text-center">
            {{ t('common.credit_current') }}
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-h4 text-weight-bold text-positive">
            {{ t('common.credit_days_remaining', { days: subscriptionStore.daysRemaining }) }}
          </div>
          <div class="text-caption text-grey q-mt-sm">
            {{ t('common.credit_until') }} {{ new Date(subscriptionStore.subscription.ends_at).toLocaleDateString() }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="text-center q-mb-lg">
      <div class="text-subtitle1 text-grey-7">
        Elegí la cantidad de días que querés agregar a tu cuenta
      </div>
    </div>

    <div class="plans-container">
      <q-card
        v-for="item in plans"
        :key="item.plan"
        class="subscription-card shadow-4"
      >
        <q-card-section class="bg-primary text-white">
          <div class="text-h5 text-center">
            {{ item.label }}
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-h3 text-weight-bold">
            {{ formatPrice(item.amount, item.currency) }}
          </div>

          <div class="text-subtitle2 text-grey-7 q-mt-sm">
            {{ item.days }} días de acceso
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <ul class="features-list">
            <li>Acceso completo al sistema</li>
            <li>Actualizaciones incluidas</li>
            <li>Soporte estándar</li>
          </ul>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            color="primary"
            size="lg"
            class="full-width"
            :loading="loadingPlan === item.plan"
            :disable="loadingPlan !== null"
            @click="subscribe(item.plan)"
          >
            Continuar al pago
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
.plans-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 22rem));
    gap: 1.5rem;
    justify-content: center;
}

.subscription-card {
    width: 100%;
}

.current-plan-card {
    max-width: 30rem;
    margin: 0 auto;
}

.features-list {
    margin: 0;
    padding-left: 1rem;
}
</style>