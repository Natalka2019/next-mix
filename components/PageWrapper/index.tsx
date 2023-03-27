import styles from "./PageWrapper.module.css";
import {ReactNode} from 'react';

type Props = {
    children: ReactNode
};
export default function PageWrapper ({ children }: Props) {
    return (
        <div className={styles.container}>
            {children}
        </div>
    )
}