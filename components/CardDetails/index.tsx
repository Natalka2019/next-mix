import React from "react";
import {Elements} from "@stripe/react-stripe-js";

import CardDetailsForm from "../CardDetailsForm";
import getStripejs from "@/utils/get-stripejs";
import styles from "./CheckoutCard.module.css";

const stripePromise = getStripejs();

interface IProps {
    userEmail: string | undefined | null;
}

const CardDetails: React.FC<IProps> = ({userEmail}) => (
    <div className={styles.wrapper}>
        <Elements stripe={stripePromise}>
            <CardDetailsForm userEmail={userEmail}/>
        </Elements>
    </div>
);

export default CardDetails;
