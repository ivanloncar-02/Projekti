import React from "react";
import styles from './SignupScreen.module.css'
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from "react-router-dom";

const LoginScreen = (props) => {
    const [signupData, setLoginData] = useState({
        username:"",
        password:"",
        firstName:"",
        lastName:"",
        email:""
    });

    function handleSubmit(e) {
        e.preventDefault();

        const response = fetch("//localhost:5001/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: signupData.username,
                password: signupData.password,
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
            }),
        });

        response
            .then((value) => {
                return value.json();
            })
            .then((valueJSON) => {
                console.log(`Response from server: ${valueJSON.userAuthenticated}`);
                //provjerit jeli signup dobar?
            })
            .catch((err) => {
                console.error(err);
            })
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...signupData, [name]: value });
    }

    return (
        <div className={styles.signupScreenContainer}>
            <h1>Sign up</h1>
            <form className={styles.signupForm} onSubmit={handleSubmit} >
                <label for="username">Username</label>
                <input 
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={signupData.username}
                    onChange={handleChange}
                    required>
                </input>
                <label for="password">Password</label>
                <input 
                    type="password" 
                    placeholder="Password" 
                    name="password" 
                    value={signupData.password}
                    onChange={handleChange}
                    required>
                </input>
                <label for="firstName">First name</label>
                <input 
                    type="text" 
                    placeholder="First name" 
                    name="firstName" 
                    value={signupData.email}
                    onChange={handleChange}
                    required>
                </input>
                <label for="lastName">Last name</label>
                <input 
                    type="text" 
                    placeholder="Last name" 
                    name="lastName" 
                    value={signupData.email}
                    onChange={handleChange}
                    required>
                </input>
                <label for="email">E-mail</label>
                <input 
                    type="text" 
                    placeholder="E-mail" 
                    name="email" 
                    value={signupData.email}
                    onChange={handleChange}
                    required>
                </input>
                <button type="submit" className={styles.button}> Sign up </button>
            </form>
                <span>Or</span>
            <div className={styles.formFooter}> {/* ime, prezime, email?? */}
                <span>New to Radio Odyssey?</span>
                <br />
                <Link to="/map">
                    <button className={styles.button}>
                        Continue as a guest
                    </button>
                </Link>
                <br />
                <span>Already have an account?</span>
                <br />
                <Link to="/login">
                    <button className={styles.button}>
                        Login
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default LoginScreen