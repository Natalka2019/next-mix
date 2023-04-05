import React from "react";
import {Elements} from "@stripe/react-stripe-js";

import CheckoutForm from "../CheckoutForm";
import getStripejs from "@/utils/get-stripejs";

const stripePromise = getStripejs();

interface IProps {
    userEmail: string | undefined | null;
}

const CheckoutCard: React.FC<IProps> = ({userEmail}) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm userEmail={userEmail}/>
    </Elements>
);

export default CheckoutCard;
