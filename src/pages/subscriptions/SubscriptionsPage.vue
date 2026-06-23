<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRequests } from '../../composition/useRequests'
import { subscriptionService } from 'src/services/Subscription'
import { useSubscriptionStore } from 'src/stores/subscription'

const quasar = useQuasar()
const { t } = useI18n()
const { request } = useRequests()
const subscriptionStore = useSubscriptionStore()

const loadingPlan = ref<string | null>(null)

const plans = [
  {
    name: 'Mensual',
    plan: 'monthly',
    price: '$20.000',
    description: 'Facturación mensual'
  },
  {
    name: 'Trimestral',
    plan: 'quarterly',
    price: '$50.000',
    description: 'Facturación cada 3 meses'
  },
  {
    name: 'Anual',
    plan: 'yearly',
    price: '$180.000',
    description: 'Facturación anual'
  }
] as const

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
      message: 'No se pudo iniciar la suscripción'
    })
  } finally {
    loadingPlan.value = null
  }
}

onMounted(async () => {
  await subscriptionStore.fetchStatus()
})
</script>

<template>
  <q-page class="q-pa-lg">
    <div class="text-center q-mb-xl">
      <div class="text-h4">
        {{ t('common.subscription_manage') }}
      </div>
    </div>

    <div
      v-if="subscriptionStore.hasActiveSubscription && subscriptionStore.subscription"
      class="q-mb-xl"
    >
      <q-card class="current-plan-card shadow-4">
        <q-card-section class="bg-positive text-white">
          <div class="text-h5 text-center">
            {{ t('common.subscription_current') }}
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-h4 text-weight-bold text-positive">
            {{ subscriptionStore.planLabel }}
          </div>
          <div class="text-subtitle1 q-mt-md">
            {{ t('common.subscription_days_remaining', { days: subscriptionStore.daysRemaining }) }}
          </div>
          <div class="text-caption text-grey q-mt-sm">
            {{ t('common.subscription_until') }} {{ new Date(subscriptionStore.subscription.ends_at).toLocaleDateString() }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="text-center q-mb-lg">
      <div class="text-subtitle1 text-grey-7">
        Elegí el plan que mejor se adapte a tus necesidades
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
            {{ item.name }}
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-h3 text-weight-bold">
            {{ item.price }}
          </div>

          <div class="text-subtitle2 text-grey-7 q-mt-sm">
            {{ item.description }}
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
