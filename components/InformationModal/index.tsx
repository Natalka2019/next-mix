import React, {useState} from "react";
import axios from "axios";
import ListPaymentMethods from "@/components/ListPaymentMethods";
import PaymentForm from "@/components/PaymentForm";
import {Elements} from "@stripe/react-stripe-js";
import getStripejs from "@/utils/get-stripejs";
import {PaymentMethod} from '@stripe/stripe-js';
import styles from "./informationModal.module.css";
import {PAYMENT_SCREENS, UNITED_STATES_DOLLARS} from "@/constants";
import {IDestinations} from "@/types/map";



interface IProps {
    userEmail: string | undefined;
    userName: string | undefined;
    distance: number;
    onClose: () => void;
    movement: () => void;
    destinations: IDestinations;
}

interface IScreen {
    paymentMethods: boolean;
    paymentForm: boolean;
}

const stripePromise = getStripejs();

const InformationModal: React.FC<IProps> = (
    {
        userEmail = "",
        userName = "",
        distance,
        onClose,
        movement,
        destinations
    }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>();
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [activeScreen, setActiveScreen] = useState<IScreen>({
        paymentMethods: true,
        paymentForm: false,
    });

    const customerId = localStorage.getItem(userEmail);
    const distanceTransformedToAmount = (Math.round(distance / 100000 * 100) / 100).toFixed(2);

    function handleSelectCard(method: PaymentMethod) {

        console.log("method", method);
        setSelectedMethod(method);
        createPaymentIntent(method.id);
    }

    const createPaymentIntent = async (selectedPaymentMethodId: string) => {


        console.log("selectedPaymentMethodId", selectedPaymentMethodId);
        try {
            const response = await axios.post("/api/stripe/create-payment", {
                paymentMethod: selectedPaymentMethodId,
                amount: distanceTransformedToAmount,
                currency: UNITED_STATES_DOLLARS,
                userCustomerId: customerId
            });

            setPaymentIntent(response.data);
            changeActiveScreen(PAYMENT_SCREENS.paymentForm);
        } catch (err) {
            console.log(err);
        }

    }

    function changeActiveScreen(screen: string) {
        let activeScreenUpdated = {paymentMethods: false, paymentForm: false};
        activeScreenUpdated[screen as keyof IScreen] = true;
        setActiveScreen(activeScreenUpdated);
    }


    return (
        <div>
            <h2 className={styles.modalTitle}>Payment modal</h2>
            <p className={styles.route}>Route:</p>
            {Object.keys(destinations).map((destKey) => (
                <span key={destKey}>
                    <span>{destinations[destKey as keyof IDestinations]?.city}, </span>
                    <span>{destinations[destKey as keyof IDestinations]?.country}</span>
                    { destKey !== "C" && <span> =&gt; </span>}
                </span>
            ))}
            <p className={styles.distance}><span className={styles.title}>Distance: </span>{(Math.round(distance / 1000)).toFixed(0)} km</p>
            <p className={styles.distance}><span className={styles.title}>Amount: </span>${distanceTransformedToAmount}</p>
            <p><span className={styles.title}>Passenger name: </span>{userName}</p>
            <p><span className={styles.title}>Passenger email: </span>{userEmail}</p>

            <div>
                {activeScreen.paymentMethods &&
                    <ListPaymentMethods handleSelectCard={handleSelectCard} customerId={customerId}/>}

                {activeScreen.paymentForm && paymentIntent && selectedMethod && (
                    <Elements stripe={stripePromise}>
                        <PaymentForm paymentIntent={paymentIntent} paymentMethod={selectedMethod} onClose={onClose}
                                     movement={movement}/>
                    </Elements>
                )}
            </div>


        </div>
    )
}

export default InformationModal;