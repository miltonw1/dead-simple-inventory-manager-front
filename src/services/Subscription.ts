import Service from './Service'
import HttpResponse, { handle } from './Response'

export interface SubscriptionCheckoutResponse {
    checkout_url: string
}

class SubscriptionService extends Service {
    createCheckout(plan: 'monthly' | 'quarterly' | 'yearly') {
        return handle<SubscriptionCheckoutResponse>(
            fetch('http://localhost:8000/api/subscription/checkout', {
                method: 'POST',
                headers: this.authHeader(),
                body: JSON.stringify({ plan })
            })
        )
    }
}

export const subscriptionService = new SubscriptionService()