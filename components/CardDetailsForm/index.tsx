import React, {FormEvent, useState} from "react";
import {CardElement, useStripe, useElements} from "@stripe/react-stripe-js";
import axios from "axios";
import styles from "./CardDetails.module.css";

interface IProps {
    userEmail: string | undefined | null;
    setShowMapButton: (status: boolean) => void;
}

const CardDetailsForm: React.FC<IProps> = ({userEmail, setShowMapButton}) => {
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
                email: userEmail,
                paymentMethod: paymentMethod
            });

            if (userEmail) {
                localStorage.setItem(userEmail, response.data.customer.id);
            }

            setSavingSuccess(true);
            setShowMapButton(true);

        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
                setSavingError(error.message);
            }
        }

    };

    if (savingSuccess) return <p>Card details successfully saved!</p>;

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="card-element" className={styles.label}>Enter credit or debit card details</label>
            <CardElement id="card-element" onChange={handleChange}/>
            <div className="card-errors" role="alert">{error}</div>

            <div className={styles.buttonContainer}>
                <button type="submit" disabled={!stripe} className={styles.buttonSubmit}>
                    Save card details
                </button>
            </div>

            {savingError && <span style={{color: "red"}}>{savingError}</span>}
        </form>
    );
};

export default CardDetailsForm;