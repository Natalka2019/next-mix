import React from "react";
import {useState} from "react";
import style from "./PaymentForm.module.css";
import joinClassNames from "../../utils/joinClassNames";
import {format} from "date-fns";
import {useStripe, CardCvcElement, useElements} from "@stripe/react-stripe-js";
import axios from "axios";
import {PaymentMethod} from '@stripe/stripe-js';

interface IProps {
    paymentMethod: PaymentMethod;
    paymentIntent: any;
    onClose: () => void;
    movement: () => void;
}


const PaymentForm: React.FC<IProps> = ({paymentMethod, paymentIntent, onClose, movement}) => {
    const stripe = useStripe();
    const elements = useElements();

    const [cvcError, setCvcError] = useState(null);

    const {card, billing_details} = paymentMethod;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!paymentMethod) return;

        try {
            await stripe.createToken("cvc_update", elements.getElement(CardCvcElement));

            const response = await axios.post("/api/stripe/confirm-payment", {
                paymentMethod: paymentMethod.id,
                paymentIntent: paymentIntent.id,
            });


            handleServerResponse(response.data);

        } catch (error) {
            setCvcError(error.message);
        }

    };

    function handleServerResponse(response) {
        if (response.error) {
            /* Handle Error */
            console.log(error);
        } else if (response.next_action) {
            handleAction(response);
        } else {
            alert("Payment Success");
            /* Handle Success */

            onClose();
            movement();
        }
    }

    const handleAction = async (response) => {
        try {
            await stripe.handleCardAction(response.client_secret);

            const result = await axios.post("/api/stripe/confirm-payment", {
                paymentMethod: paymentMethod.id,
                paymentIntent: paymentIntent.id,
            });


            handleServerResponse(result.data);

        } catch (error) {
            setCvcError(error.message);
        }
    }

    if (!card) return null;

    return (

        <div className={style.wrapper}>
            <form onSubmit={handleSubmit}>
                <div className={style.card}>
                    <div className={style.row}>
                        <label className={style.label}>Cardholder Name</label>
                        <p>{billing_details.name}</p>
                    </div>
                    <div className={joinClassNames(style.row, style.col)}>
                        <div className={style.cardNumber}>
                            <label className={style.label}>Card Number</label>
                            <p>{`**** **** **** ${card.last4}`}</p>
                        </div>
                        <div className={style.expiry}>
                            <label className={style.label}>Card Expiry</label>
                            <p>{format(new Date(`${card.exp_year}/${card.exp_month}/01`), "mm/yyyy")}</p>
                        </div>
                    </div>

                    <div className={style.row}>
                        <label className={style.label}>Enter Cvc/Cvv </label>
                        <div className={style.cvcInput}>
                            <CardCvcElement
                                onChange={() => {
                                    setCvcError(null);
                                }}
                            />
                        </div>
                        <p className={style.cvcError}>{cvcError}</p>
                    </div>
                </div>

                <button>Make Payment</button>
            </form>
        </div>

    );
}

export default PaymentForm;