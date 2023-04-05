import React, {FormEvent, useState} from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

interface IProps {
    userEmail: string | undefined | null;
}

const CheckoutForm: React.FC<IProps> = ({ userEmail }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [savingError, setSavingError] = useState("");
    const [savingSuccess, setSavingSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Handle real-time validation errors from the CardElement.
    const handleChange = (event: any) => {
        if (event.error) {
            setError(event.error.message);
        } else {
            setError(null);
        }
    }
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return null;
        }

        const card = elements.getElement(CardElement);

        if (!card) {
            return null;
        }

        try {
            const {paymentMethod, error} = await stripe.createPaymentMethod({
                type: 'card',
                card: card
            });

            const response = await axios.post("/api/stripe/create-stripe-customer", {
                email: "test8@test.com",
                paymentMethod: paymentMethod
            });

            console.log("response", response);

            localStorage.setItem("test8@test.com", response.data.customer.id);

            setSavingSuccess(true);


        } catch (error) {
            console.log(error);

            alert(error.message);
            setSavingError(error.message);
        }

    };

    if (savingSuccess) return <p>Payment successful!</p>;

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="card-element">Credit or debit card</label>
            <CardElement id="card-element" onChange={handleChange}/>
            <div className="card-errors" role="alert">{error}</div>

            <button type="submit" disabled={!stripe}>
                Save card details
            </button>

            {savingError && <span style={{ color: "red" }}>{savingError}</span>}
        </form>
    );
};

export default CheckoutForm;