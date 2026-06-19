// services/subscription.service.ts

import HttpResponse, { handle } from './Response'

export interface SubscriptionCheckoutResponse {
    init_point: string
}

class SubscriptionService {
    createCheckout(plan: 'monthly' | 'quarterly' | 'yearly') {
        return handle<SubscriptionCheckoutResponse>(
            fetch('/api/subscription/checkout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan })
            })
        )
    }
}

export const subscriptionService = new SubscriptionService()