package com.example.kvizznanja.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.kvizznanja.R
import com.example.kvizznanja.ui.main.MainActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserProfileChangeRequest
import com.example.kvizznanja.data.model.User
import com.example.kvizznanja.data.repository.QuizRepository
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
class RegisterActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var nameEditText: EditText
    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var confirmPasswordEditText: EditText
    private lateinit var registerButton: Button
    private lateinit var loginTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        auth = FirebaseAuth.getInstance()

        initViews()
        setupListeners()
    }

    private fun initViews() {
        nameEditText = findViewById(R.id.nameEditText)
        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText)
        registerButton = findViewById(R.id.registerButton)
        loginTextView = findViewById(R.id.loginTextView)
    }

    private fun setupListeners() {
        registerButton.setOnClickListener {
            val name = nameEditText.text.toString().trim()
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            val confirmPassword = confirmPasswordEditText.text.toString().trim()

            if (validateInput(name, email, password, confirmPassword)) {
                registerUser(name, email, password)
            }
        }

        loginTextView.setOnClickListener {
            finish()
        }
    }

    private fun validateInput(
        name: String,
        email: String,
        password: String,
        confirmPassword: String
    ): Boolean {
        if (name.isEmpty()) {
            nameEditText.error = "Unesite ime"
            return false
        }

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

        if (password != confirmPassword) {
            confirmPasswordEditText.error = "Lozinke se ne podudaraju"
            return false
        }

        return true
    }

    private fun registerUser(name: String, email: String, pass: String) {
        registerButton.isEnabled = false

        auth.createUserWithEmailAndPassword(email, pass)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val firebaseUser = auth.currentUser

                    // 1. Ažuriramo profil u Authenticationu (to već imaš)
                    val profileUpdates = UserProfileChangeRequest.Builder()
                        .setDisplayName(name)
                        .build()

                    firebaseUser?.updateProfile(profileUpdates)
                        ?.addOnCompleteListener { updateTask ->
                            if (updateTask.isSuccessful) {

                                // 2. SADA spremi te iste podatke u Firestore "users" kolekciju
                                // Bez ovoga, lista "All Players" će biti prazna!
                                val userForDatabase = User(
                                    uid = firebaseUser.uid,
                                    email = email,
                                    displayName = name
                                )

                                // Pokretanje spremanja u bazu preko tvog Repositoryja
                                lifecycleScope.launch {
                                    val repository = QuizRepository()
                                    val dbResult = repository.saveUser(userForDatabase)

                                    registerButton.isEnabled = true
                                    if (dbResult.isSuccess) {
                                        Toast.makeText(this@RegisterActivity, "Uspjeh!", Toast.LENGTH_SHORT).show()
                                        navigateToMain()
                                    } else {
                                        Toast.makeText(this@RegisterActivity, "Greška u bazi: ${dbResult.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            }
                        }
                } else {
                    registerButton.isEnabled = true
                    Toast.makeText(this, "Greška: ${task.exception?.message}", Toast.LENGTH_LONG).show()
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