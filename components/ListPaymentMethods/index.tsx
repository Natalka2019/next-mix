import React, { useEffect, useState } from "react";
import style from "./ListPaymentMethods.module.css";
import axios from "axios";
import {PaymentMethod} from '@stripe/stripe-js';
import {format} from "date-fns";

interface IProps {
    handleSelectCard: (method: any) => void;
    customerId: string | null;
}

const ListPaymentMethods: React.FC<IProps> = ({ handleSelectCard, customerId }) => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const getPaymentMethods = async () => {
        const response = await axios.get("/api/stripe/get-payment-methods", {
            params: {
                customerId
            }
        });

        setPaymentMethods(response.data.data);
    };

    useEffect(() => {
        getPaymentMethods();
    }, []);


    return (
        <div className={style.wrapper}>
            <h3 className={style.title}>Select your preferred payment method</h3>
            {paymentMethods.length &&
                paymentMethods.map((method) => {
                    if(!method) return;
                    return <div key = {method.card?.last4} className={style.card} onClick={() => {
                        handleSelectCard(method)}
                    }>

                        <div className={style.details}>
                            <p>
                                {method.card?.brand} **** {method.card?.last4}
                            </p>
                            <p>{method.billing_details.name}</p>
                        </div>

                        <div className={style.expire}>
                            Expires{" "}
                            {format(new Date(`${method.card?.exp_year}/${method.card?.exp_month}/01`), "mm/yyyy")}
                        </div>
                    </div>
                })}
        </div>
    );
}

export default ListPaymentMethods;