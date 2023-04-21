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
            //confirmation_method: "manual", // For 3D Security. Manual confirmation for Payment Intents is for server-side confirmation only (i.e. with your secret API key, not your publishable key). Setting confirmation_method to manual on a Payment Intent is the same as saying, "this Payment Intent can only be confirmed server-side".
            confirmation_method: "automatic",
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