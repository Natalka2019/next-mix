import Head from "next/head";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";
import {useSession} from "next-auth/react";
import PageWrapper from "@/components/PageWrapper";
import Link from "next/link";

export default function Home() {
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