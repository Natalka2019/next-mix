import React from "react";
import Stripe from "stripe";
import {parseCookies, setCookie} from "nookies";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";

import CheckoutForm from "../CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutCard = ({paymentIntent}) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm paymentIntent={paymentIntent} />
    </Elements>
);

export default CheckoutCard;
