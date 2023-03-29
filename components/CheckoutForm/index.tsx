import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { destroyCookie } from "nookies";

const CheckoutForm = ({ paymentIntent, userEmail }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [checkoutError, setCheckoutError] = useState();
    const [checkoutSuccess, setCheckoutSuccess] = useState();
    const [error, setError] = useState(null);

    // Handle real-time validation errors from the CardElement.
    const handleChange = (event) => {
        if (event.error) {
            setError(event.error.message);
        } else {
            setError(null);
        }
    }
    const handleSubmit = async e => {
        e.preventDefault();

        const card = elements.getElement(CardElement);

        // const customer = await stripe.customers.create({
        //     email: userEmail
        // });

        // add these lines
        // const {paymentMethod, error} = await stripe.createPaymentMethod({
        //     type: 'card',
        //     card: card
        // });

        try {
            const {
                error,
                paymentIntent: { status }
            } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });

            if (error) throw new Error(error.message);

            if (status === "succeeded") {
                setCheckoutSuccess(true);
                destroyCookie(null, "paymentIntentId");
            }
        } catch (err) {
            alert(err.message);
            setCheckoutError(err.message);
        }
    };

    if (checkoutSuccess) return <p>Payment successful!</p>;

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="card-element">Credit or debit card</label>
            <CardElement id="card-element" onChange={handleChange}/>
            <div className="card-errors" role="alert">{error}</div>

            <button type="submit" disabled={!stripe}>
                Pay now
            </button>

            {checkoutError && <span style={{ color: "red" }}>{checkoutError}</span>}
        </form>
    );
};

export default CheckoutForm;