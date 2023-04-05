import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";

interface IProps {
    show: boolean;
    children: React.ReactNode;
    onClose: () => void;
    title?: string;
}

const Modal: React.FC<IProps> = ({show, onClose, children, title}) => {
    const [isBrowser, setIsBrowser] = useState(false);

    const modalWrapperRef = React.useRef<HTMLInputElement>(null);

    const backDropHandler = (e: React.MouseEvent) => {
        if (!modalWrapperRef?.current?.contains(e.target as HTMLElement)) {
            onClose();
        }
    }

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    const handleCloseClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onClose();
    };

    const modalContent = show ? (
        <div className={styles.overlay} onClick={backDropHandler}>
            <div className={styles.wrapper} ref={modalWrapperRef}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <a href="#" onClick={handleCloseClick}>
                            x
                        </a>
                    </div>
                    {title && <div>{title}</div>}
                    <div className={styles.body}>{children}</div>
                </div>
            </div>
        </div>
    ) : null;

    if (isBrowser) {
        return ReactDOM.createPortal(
            modalContent,
            document.getElementById("modal-root")! //Typescript non-null assertion
        );
    } else {
        return null;
    }
};


export default Modal;
