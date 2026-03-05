// ui/leaderboard/LeaderboardActivity.kt
package com.example.kvizznanja.ui.leaderboard

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.kvizznanja.R
import com.example.kvizznanja.data.model.GameResult
import com.example.kvizznanja.data.repository.QuizRepository
import kotlinx.coroutines.launch

class LeaderboardActivity : AppCompatActivity() {

    private lateinit var repository: QuizRepository
    private lateinit var leaderboardRecyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_leaderboard)

        repository = QuizRepository()

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Top 10 Igrača"

        initViews()
        loadLeaderboard()
    }

    private fun initViews() {
        leaderboardRecyclerView = findViewById(R.id.leaderboardRecyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyTextView = findViewById(R.id.emptyTextView)

        leaderboardRecyclerView.layoutManager = LinearLayoutManager(this)
    }

    private fun loadLeaderboard() {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            repository.getTopResults(10).fold(
                onSuccess = { results ->
                    progressBar.visibility = View.GONE

                    if (results.isEmpty()) {
                        emptyTextView.visibility = View.VISIBLE
                        leaderboardRecyclerView.visibility = View.GONE
                    } else {
                        emptyTextView.visibility = View.GONE
                        leaderboardRecyclerView.visibility = View.VISIBLE
                        leaderboardRecyclerView.adapter = LeaderboardAdapter(results)
                    }
                },
                onFailure = { error ->
                    progressBar.visibility = View.GONE
                    Toast.makeText(
                        this@LeaderboardActivity,
                        "Greška pri učitavanju: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            )
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

// Adapter za leaderboard
class LeaderboardAdapter(private val results: List<GameResult>) :
    RecyclerView.Adapter<LeaderboardAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val rankTextView: TextView = view.findViewById(R.id.rankTextView)
        val nameTextView: TextView = view.findViewById(R.id.nameTextView)
        val scoreTextView: TextView = view.findViewById(R.id.scoreTextView)
        val detailsTextView: TextView = view.findViewById(R.id.detailsTextView)
    }

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_leaderboard, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val result = results[position]

        // Rang za top 3
        holder.rankTextView.text = when (position) {
            0 -> "🥇"
            1 -> "🥈"
            2 -> "🥉"
            else -> "${position + 1}."
        }

        holder.nameTextView.text = result.playerName
        holder.scoreTextView.text = "${result.score} bodova"
        holder.detailsTextView.text = "${result.correctAnswers}/${result.totalQuestions} točno"

        // Highlighting za top 3
        if (position < 3) {
            holder.itemView.setBackgroundColor(
                android.graphics.Color.parseColor("#FFF9C4")
            )
        }
    }

    override fun getItemCount() = results.size
}