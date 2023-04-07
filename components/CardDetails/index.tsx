import React from "react";
import {Elements} from "@stripe/react-stripe-js";

import CardDetailsForm from "../CardDetailsForm";
import getStripejs from "@/utils/get-stripejs";
import styles from "./CheckoutCard.module.css";

const stripePromise = getStripejs();

interface IProps {
    userEmail: string | undefined | null;
    setShowMapButton: (status: boolean) => void;
}

const CardDetails: React.FC<IProps> = ({userEmail, setShowMapButton}) => (
    <div className={styles.wrapper}>
        <Elements stripe={stripePromise}>
            <CardDetailsForm userEmail={userEmail} setShowMapButton={setShowMapButton}/>
        </Elements>
    </div>
);

export default CardDetails;
