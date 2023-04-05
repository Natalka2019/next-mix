import {NextApiRequest, NextApiResponse} from "next";
import getStripe from "../../../utils/get-stripe";


const stripe = getStripe();

const getPaymentMethods = async (req: NextApiRequest, res: NextApiResponse) => {

    const {customerId} = req.query;

    try {
        const paymentMethods = await listCustomerPayMethods(customerId);
        res.status(200).json(paymentMethods);
    } catch (err) {
        console.log(err);
        res.status(500).json("Could not get payment methods");
    }
}

async function listCustomerPayMethods(customerId: string) {
    return new Promise(async (resolve, reject) => {
        try {
            const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
                type: "card",
            });
            resolve(paymentMethods);
        } catch (err) {
            reject(err);
        }
    });

}

export default getPaymentMethods;