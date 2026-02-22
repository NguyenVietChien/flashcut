import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
        _stripe = new Stripe(key);
    }
    return _stripe;
}

export const PLANS = {
    basic: {
        name: "Basic",
        price: 400000,
        currency: "vnd",
    },
    pro: {
        name: "Pro",
        price: 700000,
        currency: "vnd",
    },
    ultra: {
        name: "Ultra",
        price: 1200000,
        currency: "vnd",
    },
} as const;

export type PlanId = keyof typeof PLANS;

export function isValidPlan(plan: string): plan is PlanId {
    return plan in PLANS;
}
