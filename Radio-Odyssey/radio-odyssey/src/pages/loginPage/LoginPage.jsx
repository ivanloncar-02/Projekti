import React from "react";
import styles from './LoginPage.module.css'
import LoginScreen from "../../components/loginScreen/LoginScreen";

const LoginPage = () => {
    return (
        <div className={styles.backgroundImageContainer}>
            <LoginScreen />
        </div>
    );
}

export default LoginPage