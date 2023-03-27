import {signIn, signOut, useSession} from 'next-auth/react';
import styles from "./Header.module.css";

export default function Header () {
    const { data: session } = useSession();

    const handleSignin = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        signIn();
    };

    const handleSignout = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        signOut();
    };

    return (
        <div className={styles.header}>
            <h1 className={styles.title}>Mix</h1>
            {session ? (
                <a className={styles.signInLink} href="components#" onClick={handleSignout}>
                    <button className={styles.signInButton}>Sign out</button>
                </a>
            ) : (
                <a className={styles.signInLink} href="components#" onClick={handleSignin}>
                    <button className={styles.signInButton}> Sign in</button>
                </a>
            )}
        </div>
    )
}