import Head from "next/head";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";
import {useSession} from "next-auth/react";
import PageWrapper from "@/components/PageWrapper";
import Link from "next/link";
import CheckoutCard from "@/components/CheckoutCard"
import Stripe from "stripe";
import {parseCookies, setCookie} from "nookies";

export default function Home({paymentIntent}) {
    const {data: session, status} = useSession();
    const loading = status === "loading";


    return (
        <>
            <Head>
                <title>Next.js</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Header/>
            <PageWrapper>
                <main className={styles.main}>
                    <div className={styles.user}>
                        {loading && <div>Loading...</div>}
                        {session && (
                            <>
                                <p style={{marginBottom: "10px"}}>
                                    Welcome, {session.user?.name ?? session.user?.email}
                                </p>
                                <br/>

                                {session.user?.image &&
                                    <img src={session.user.image} alt="" className={styles.avatar}/>}

                                <div>
                                    <CheckoutCard paymentIntent = {paymentIntent}/>
                                </div>

                                <div className={styles.mapButton}>
                                    <Link href="/map">Show map</Link>
                                </div>

                            </>
                        )}
                    </div>
                </main>
            </PageWrapper>
        </>
    );
}


export const getServerSideProps = async ctx => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let paymentIntent;

    const {paymentIntentId} = await parseCookies(ctx);

    if (paymentIntentId) {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        return {
            props: {
                paymentIntent
            }
        };
    }

    paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: "gbp"
    });

    setCookie(ctx, "paymentIntentId", paymentIntent.id);


    return {
        props: {
            paymentIntent
        }
    };
};