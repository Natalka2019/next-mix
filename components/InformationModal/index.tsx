import React, {useState} from "react";
import axios from "axios";
import ListPaymentMethods from "@/components/ListPaymentMethods";
import PaymentForm from "@/components/PaymentForm";
import {Elements} from "@stripe/react-stripe-js";
import getStripejs from "@/utils/get-stripejs";
import {PaymentMethod} from '@stripe/stripe-js';


interface IProps {
    userEmail: string | undefined;
    distance: number;
    onClose: () => void;
    movement: () => void;
}

interface IScreen {
    paymentMethods: boolean;
    paymentForm: boolean;
}

const stripePromise = getStripejs();

const InformationModal: React.FC<IProps> = ({userEmail = "", distance, onClose, movement}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>();
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [activeScreen, setActiveScreen] = useState<IScreen>({
        paymentMethods: true,
        paymentForm: false,
    });

    const customerId = localStorage.getItem(userEmail);
    const distanceTransformedToAmount = (Math.round(distance / 100000 * 100) / 100).toFixed(2);

    function handleSelectCard(method: PaymentMethod) {
        setSelectedMethod(method);
        createPaymentIntent(method.id);
    }

    const createPaymentIntent = async (selectedPaymentMethodId: string) => {


        console.log("selectedPaymentMethodId", selectedPaymentMethodId);
        try {
            const response = await axios.post("/api/stripe/create-payment", {
                paymentMethod: selectedPaymentMethodId,
                amount: distanceTransformedToAmount,
                currency: "USD",
                userCustomerId: customerId
            });

            setPaymentIntent(response.data);
            changeActiveScreen("paymentForm");
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
            Hello from Modal

            <p>{userEmail}</p>
            <p>{distance}</p>
            <div>
                {activeScreen.paymentMethods &&
                    <ListPaymentMethods handleSelectCard={handleSelectCard} customerId={customerId}/>}

                {activeScreen.paymentForm && paymentIntent && selectedMethod &&(
                    <Elements stripe={stripePromise}>
                        <PaymentForm paymentIntent={paymentIntent} paymentMethod={selectedMethod} onClose={onClose} movement={movement}/>
                    </Elements>
                )}
            </div>


        </div>
    )
}

export default InformationModal;