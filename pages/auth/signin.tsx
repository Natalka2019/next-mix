import type {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {getProviders, signIn} from "next-auth/react";
import {getServerSession} from "next-auth/next";
import {authOptions} from "../api/auth/[...nextauth]";
import {useRouter} from 'next/router';
import styles from '../../styles/Signin.module.css'
import PageWrapper from "@/components/PageWrapper";

export default function SignIn({providers}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {query: {callbackUrl}} = useRouter();

    return (
        <PageWrapper>
            <div className={styles.cardWrapper}>
                <div className={styles.cardContent}>
                    {Object.values(providers).map((provider) => (
                        <div key={provider.name}>
                            <a href={provider.signinUrl} onClick={(e) => e.preventDefault()}>
                                <button onClick={() => signIn(provider.id, {callbackUrl})}>
                                    Sign in with {provider.name}
                                </button>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </PageWrapper>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // If the user is already logged in, redirect.
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    if (session) {
        return {redirect: {destination: "/"}};
    }

    const providers = await getProviders();

    return {
        props: {providers: providers ?? []}
    }
}