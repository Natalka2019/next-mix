import {NextApiRequest, NextApiResponse} from "next";

import getStripe from "../../../utils/get-stripe";

const stripe = getStripe();

const createPayment = async (req: NextApiRequest, res: NextApiResponse) => {

    const {paymentMethod, amount, currency, userCustomerId} = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: currency,
            customer: userCustomerId,
            payment_method: paymentMethod,
            confirmation_method: "manual", // For 3D Security
            description: "Buy Product",
        });

        /* Add the payment intent record to your datbase if required */
        res.status(200).json(paymentIntent);
    } catch (err) {
        console.log(err);
        res.status(500).json("Could not create payment");
    }

}

export default createPayment;