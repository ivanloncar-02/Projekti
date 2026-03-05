package com.example.kvizznanja.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.kvizznanja.R

import com.example.kvizznanja.ui.auth.RegisterActivity
import com.google.firebase.auth.FirebaseAuth
import com.example.kvizznanja.ui.main.MainActivity
class LoginActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button
    private lateinit var registerTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        auth = FirebaseAuth.getInstance()

        // Provjeri je li korisnik već prijavljen
        if (auth.currentUser != null) {
            navigateToMain()
            return
        }

        initViews()
        setupListeners()
    }

    private fun initViews() {
        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        loginButton = findViewById(R.id.loginButton)
        registerTextView = findViewById(R.id.registerTextView)
    }

    private fun setupListeners() {
        loginButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()

            if (validateInput(email, password)) {
                loginUser(email, password)
            }
        }

        registerTextView.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun validateInput(email: String, password: String): Boolean {
        if (email.isEmpty()) {
            emailEditText.error = "Unesite email"
            return false
        }

        if (password.isEmpty()) {
            passwordEditText.error = "Unesite lozinku"
            return false
        }

        if (password.length < 6) {
            passwordEditText.error = "Lozinka mora imati najmanje 6 znakova"
            return false
        }

        return true
    }

    private fun loginUser(email: String, password: String) {
        loginButton.isEnabled = false

        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener(this) { task ->
                loginButton.isEnabled = true

                if (task.isSuccessful) {
                    Toast.makeText(this, "Uspješna prijava!", Toast.LENGTH_SHORT).show()
                    navigateToMain()
                } else {
                    Toast.makeText(
                        this,
                        "Greška pri prijavi: ${task.exception?.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
    }

    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}