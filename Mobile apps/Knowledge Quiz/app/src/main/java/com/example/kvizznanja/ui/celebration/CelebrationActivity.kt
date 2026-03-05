// ui/celebration/CelebrationActivity.kt
package com.example.kvizznanja.ui.celebration

import android.animation.ValueAnimator
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.airbnb.lottie.LottieAnimationView
import com.example.kvizznanja.R

class CelebrationActivity : AppCompatActivity() {

    private lateinit var animationView: LottieAnimationView
    private lateinit var congratsTextView: TextView
    private lateinit var scoreTextView: TextView
    private lateinit var detailsTextView: TextView
    private lateinit var doneButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_celebration)

        val score = intent.getIntExtra("score", 0)
        val correctAnswers = intent.getIntExtra("correctAnswers", 0)
        val totalQuestions = intent.getIntExtra("totalQuestions", 0)

        initViews()
        setupAnimation()
        displayResults(score, correctAnswers, totalQuestions)
    }

    private fun initViews() {
        animationView = findViewById(R.id.animationView)
        congratsTextView = findViewById(R.id.congratsTextView)
        scoreTextView = findViewById(R.id.scoreTextView)
        detailsTextView = findViewById(R.id.detailsTextView)
        doneButton = findViewById(R.id.doneButton)

        doneButton.setOnClickListener {
            finish()
        }
    }

    private fun setupAnimation() {
        try {
            animationView.setAnimation(R.raw.celebration)
            animationView.playAnimation()
            animationView.loop(true)
        } catch (e: Exception) {

        }
    }

    private fun displayResults(score: Int, correctAnswers: Int, totalQuestions: Int) {
        // Animiraj prikaz rezultata
        scoreTextView.text = "0"

        val scoreAnimator = ValueAnimator.ofInt(0, score)
        scoreAnimator.duration = 2000
        scoreAnimator.addUpdateListener { animation ->
            scoreTextView.text = "${animation.animatedValue} bodova"
        }
        scoreAnimator.start()

        detailsTextView.text = "Točno: $correctAnswers/$totalQuestions"

        val percentage = (correctAnswers.toFloat() / totalQuestions * 100).toInt()

        congratsTextView.text = when {
            percentage >= 90 -> "🏆 ODLIČNO! 🏆"
            percentage >= 70 -> "⭐ SUPER! ⭐"
            percentage >= 50 -> "👍 DOBRO! 👍"
            else -> "💪 NASTAVI VJEŽBATI! 💪"
        }
    }
}