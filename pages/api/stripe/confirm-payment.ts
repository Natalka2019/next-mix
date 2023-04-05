import {NextApiRequest, NextApiResponse} from "next";

import getStripe from "../../../utils/get-stripe";

const stripe = getStripe();

const createPayment = async (req: NextApiRequest, res: NextApiResponse) => {

    const {paymentIntent, paymentMethod} = req.body;

    try {
        const intent = await stripe.paymentIntents.confirm(paymentIntent, {
            payment_method: paymentMethod,
        });

        /* Update the status of the payment to indicate confirmation */
        res.status(200).json(intent);
    } catch (err) {
        console.error(err);
        res.status(500).json("Could not confirm payment");
    }

}

export default createPayment;