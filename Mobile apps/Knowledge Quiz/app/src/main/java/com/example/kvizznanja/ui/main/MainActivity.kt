package com.example.kvizznanja.ui.main

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.kvizznanja.R
import com.example.kvizznanja.data.model.GameResult
import com.example.kvizznanja.data.repository.QuizRepository
import com.example.kvizznanja.ui.auth.LoginActivity
import com.example.kvizznanja.ui.leaderboard.LeaderboardActivity
import com.example.kvizznanja.ui.players.AllPlayersActivity
import com.example.kvizznanja.ui.quiz.QuizActivity
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var repository: QuizRepository

    private lateinit var welcomeTextView: TextView
    private lateinit var startQuizButton: Button
    private lateinit var leaderboardButton: Button
    private lateinit var allPlayersButton: Button // Novo dodano
    private lateinit var logoutButton: Button
    private lateinit var myResultsRecyclerView: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        auth = FirebaseAuth.getInstance()
        repository = QuizRepository()

        if (auth.currentUser == null) {
            navigateToLogin()
            return
        }

        initViews()
        setupListeners()
        loadUserResults()
    }

    private fun initViews() {
        welcomeTextView = findViewById(R.id.welcomeTextView)
        startQuizButton = findViewById(R.id.startQuizButton)
        leaderboardButton = findViewById(R.id.leaderboardButton)
        allPlayersButton = findViewById(R.id.allPlayersButton) // novi botun
        logoutButton = findViewById(R.id.logoutButton)
        myResultsRecyclerView = findViewById(R.id.myResultsRecyclerView)

        welcomeTextView.text = "Dobrodošli, ${auth.currentUser?.displayName ?: "Igraču"}!"
        myResultsRecyclerView.layoutManager = LinearLayoutManager(this)
    }

    private fun setupListeners() {
        startQuizButton.setOnClickListener {
            startActivity(Intent(this, QuizActivity::class.java))
        }

        leaderboardButton.setOnClickListener {
            startActivity(Intent(this, LeaderboardActivity::class.java))
        }

        // novi botun
        allPlayersButton.setOnClickListener {
            startActivity(Intent(this, AllPlayersActivity::class.java))
        }

        logoutButton.setOnClickListener {
            auth.signOut()
            navigateToLogin()
        }
    }

    private fun loadUserResults() {
        val userId = auth.currentUser?.uid ?: return

        lifecycleScope.launch {
            repository.getUserResults(userId).fold(
                onSuccess = { results ->
                    myResultsRecyclerView.adapter = ResultsAdapter(results)
                },
                onFailure = { error ->
                    Toast.makeText(
                        this@MainActivity,
                        "Greška pri učitavanju rezultata: ${error.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            )
        }
    }

    override fun onResume() {
        super.onResume()
        loadUserResults()
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

// Adapter za prikaz osobnih rezultata korisnika na dnu MainActivity-ja
class ResultsAdapter(private val results: List<GameResult>) :
    RecyclerView.Adapter<ResultsAdapter.ViewHolder>() {

    class ViewHolder(view: android.view.View) : RecyclerView.ViewHolder(view) {
        val scoreText: TextView = view.findViewById(R.id.scoreText)
        val detailsText: TextView = view.findViewById(R.id.detailsText)
    }

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_result, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val result = results[position]
        holder.scoreText.text = "${result.score} bodova"
        holder.detailsText.text = "${result.correctAnswers}/${result.totalQuestions} točno"
    }

    override fun getItemCount() = results.size
}