import Stripe from "stripe";

let stripe: Stripe | null;

const getStripe = () => {
    if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
};

export default getStripe;