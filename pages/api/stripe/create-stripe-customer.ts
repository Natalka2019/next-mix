import {NextApiRequest, NextApiResponse} from "next";
import getStripe from "../../../utils/get-stripe";

const stripe = getStripe();

const createCustomer = async (req: NextApiRequest, res: NextApiResponse) => {

    const {paymentMethod, email} = req.body;

    try {
        const customer = await stripe.customers.create({
            email: email
        });

        await stripe.paymentMethods.attach(
            paymentMethod.id,
            {customer: customer.id}
        );

        res.send({message: "Credit card details saved", customer: customer});
    } catch (err) {
        console.error(err);
        res.status(500).json("Could not save credit card details");
    }


}

export default createCustomer;

