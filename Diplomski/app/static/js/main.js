const firebaseConfig = {
    apiKey: "AIzaSyAi3ndRcB2ZD_CsKd18xWZfJXlbbg2XceM",
    authDomain: "ztp-diplomski.firebaseapp.com",
    projectId: "ztp-diplomski",
    storageBucket: "ztp-diplomski.firebasestorage.app",
    messagingSenderId: "494816087547",
    appId: "1:494816087547:web:74d9de5f61320ccdd04f5e",
    measurementId: "G-ZYBBSXJTR7"
};

if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}

const msgElement = document.getElementById('auth-message');

// --- LOGIKA ZA LOGIN STRANICU ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        if(msgElement) msgElement.innerText = "";

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return userCredential.user.getIdToken();
            })
            .then((idToken) => {
                return fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: idToken })
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // USPJEŠAN LOGIN -> Šalji na homepage (Dashboard)
                    window.location.href = '/reports/dashboard';
                } else {
                    if(msgElement) msgElement.innerText = data.message;
                    firebase.auth().signOut();
                }
            })
            .catch((error) => {
                if(msgElement) msgElement.innerText = "Pogrešan email ili lozinka.";
            });
    });
}

// --- LOGIKA ZA REGISTER STRANICU ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        if(msgElement) msgElement.innerText = "";

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return userCredential.user.getIdToken();
            })
            .then((idToken) => {
                return fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: idToken })
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if(msgElement) {
                        msgElement.style.color = "green";
                        msgElement.innerText = "Račun uspješno kreiran! Preusmjeravam na prijavu...";
                    }
                    setTimeout(() => { window.location.href = '/auth/login'; }, 2000);
                } else {
                    if(msgElement) msgElement.innerText = data.message;
                }
            })
            .catch((error) => {
                if(msgElement) msgElement.innerText = "Greška pri registraciji: " + error.message;
            });
    });
}

function logoutUser() {
    firebase.auth().signOut().then(() => {
        window.location.href = '/auth/logout';
    });
}