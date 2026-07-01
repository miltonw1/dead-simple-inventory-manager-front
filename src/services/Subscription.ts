import Service from './Service'
import { handle } from './Response'

export interface SubscriptionCheckoutResponse {
    checkout_url: string
}

export interface SubscriptionData {
    id: number
    uuid: string
    user_id: string
    status: string
    provider: string | null
    provider_subscription_id: string | null
    provider_payment_id: string | null
    external_reference: string | null
    plan: string | null
    amount: string | null
    currency: string | null
    last_payment_status: string | null
    starts_at: string | null
    ends_at: string | null
    cancelled_at: string | null
    created_at: string
    updated_at: string
}

export interface SubscriptionStatusResponse {
    has_active_subscription: boolean
    subscription: SubscriptionData | null
    days_remaining: number | null
}

export interface VerifyPendingResponse {
    verified: boolean
    has_active_subscription?: boolean
    subscription?: SubscriptionData | null
    days_remaining?: number | null
    message?: string
}

export interface PlanData {
    plan: 'monthly' | 'quarterly' | 'yearly'
    label: string
    amount: number
    currency: string
    days: number
}

class SubscriptionService extends Service {
  createCheckout (plan: 'monthly' | 'quarterly' | 'yearly') {
    return handle<SubscriptionCheckoutResponse>(
      fetch('http://localhost:8000/api/subscription/checkout', {
        method: 'POST',
        headers: this.authHeader(),
        body: JSON.stringify({ plan })
      })
    )
  }

  getStatus () {
    return handle<SubscriptionStatusResponse>(
      fetch('http://localhost:8000/api/user/subscription', {
        headers: this.authHeader()
      })
    )
  }

  verifyPending () {
    return handle<VerifyPendingResponse>(
      fetch('http://localhost:8000/api/subscription/verify-pending', {
        method: 'POST',
        headers: this.authHeader()
      })
    )
  }

  getPlans () {
    return handle<PlanData[]>(
      fetch('http://localhost:8000/api/plans', {
        headers: this.authHeader()
      })
    )
  }
}

export const subscriptionService = new SubscriptionService()
