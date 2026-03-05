package com.example.kvizznanja.ui.quiz

import android.Manifest
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.CountDownTimer
import android.telephony.TelephonyManager
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.kvizznanja.R
import com.example.kvizznanja.data.model.GameResult
import com.example.kvizznanja.data.model.QuizQuestion
import com.example.kvizznanja.data.repository.QuizRepository
import com.example.kvizznanja.ui.celebration.CelebrationActivity
import com.example.kvizznanja.utils.PhoneStateReceiver
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

class QuizActivity : AppCompatActivity() {

    private lateinit var repository: QuizRepository
    private lateinit var auth: FirebaseAuth
    private lateinit var phoneReceiver: PhoneStateReceiver

    private lateinit var questionTextView: TextView
    private lateinit var timerTextView: TextView
    private lateinit var scoreTextView: TextView
    private lateinit var progressTextView: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var answer1Button: Button
    private lateinit var answer2Button: Button
    private lateinit var answer3Button: Button
    private lateinit var answer4Button: Button

    private var questions: List<QuizQuestion> = listOf()
    private var currentQuestionIndex = 0
    private var score = 0
    private var correctAnswers = 0
    private var timeRemaining = 60 // početnih 60 sekundi
    private var timer: CountDownTimer? = null
    private var isGamePaused = false

    private val PHONE_STATE_PERMISSION_CODE = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_quiz)

        repository = QuizRepository()
        auth = FirebaseAuth.getInstance()

        initViews()
        setupPhoneStateListener()

        // Učitaj pitanja iz Firebase-a
        loadQuestionsFromFirebase(savedInstanceState)
    }

    private fun loadQuestionsFromFirebase(savedInstanceState: Bundle?) {
        // Prikaži loading
        findViewById<ProgressBar>(R.id.loadingProgressBar)?.visibility = View.VISIBLE
        enableAnswerButtons(false)

        lifecycleScope.launch {
            repository.getQuizQuestions(15).fold(
                onSuccess = { loadedQuestions ->
                    questions = loadedQuestions

                    // Sakrij loading
                    findViewById<ProgressBar>(R.id.loadingProgressBar)?.visibility = View.GONE

                    if (savedInstanceState != null) {
                        restoreGameState(savedInstanceState)
                    }

                    progressBar.max = questions.size
                    showCurrentQuestion()
                    startTimer()
                },
                onFailure = { error ->
                    // Sakrij loading
                    findViewById<ProgressBar>(R.id.loadingProgressBar)?.visibility = View.GONE

                    Toast.makeText(
                        this@QuizActivity,
                        "Greška pri učitavanju pitanja: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()

                    // Ako nema pitanja u Firebase-u, zatvori aktivnost
                    androidx.appcompat.app.AlertDialog.Builder(this@QuizActivity)
                        .setTitle("Greška")
                        .setMessage("Nije moguće učitati pitanja iz baze. Molimo pokušajte kasnije.")
                        .setPositiveButton("U redu") { _, _ ->
                            finish()
                        }
                        .setCancelable(false)
                        .show()
                }
            )
        }
    }

    private fun initViews() {
        questionTextView = findViewById(R.id.questionTextView)
        timerTextView = findViewById(R.id.timerTextView)
        scoreTextView = findViewById(R.id.scoreTextView)
        progressTextView = findViewById(R.id.progressTextView)
        progressBar = findViewById(R.id.progressBar)
        answer1Button = findViewById(R.id.answer1Button)
        answer2Button = findViewById(R.id.answer2Button)
        answer3Button = findViewById(R.id.answer3Button)
        answer4Button = findViewById(R.id.answer4Button)

        progressBar.max = questions.size

        val answerButtons = listOf(answer1Button, answer2Button, answer3Button, answer4Button)
        answerButtons.forEachIndexed { index, button ->
            button.setOnClickListener { checkAnswer(index) }
        }
    }

    private fun setupPhoneStateListener() {
        // Provjeri dozvolu
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.READ_PHONE_STATE),
                PHONE_STATE_PERMISSION_CODE
            )
        }

        phoneReceiver = PhoneStateReceiver()
        PhoneStateReceiver.onPhoneStateChanged = { isRinging ->
            if (isRinging) {
                pauseGame()
            } else {
                resumeGame()
            }
        }

        val filter = IntentFilter(TelephonyManager.ACTION_PHONE_STATE_CHANGED)
        registerReceiver(phoneReceiver, filter)
    }

    private fun showCurrentQuestion() {
        if (currentQuestionIndex >= questions.size) {
            endGame()
            return
        }

        val question = questions[currentQuestionIndex]

        questionTextView.text = question.question
        answer1Button.text = question.answers[0]
        answer2Button.text = question.answers[1]
        answer3Button.text = question.answers[2]
        answer4Button.text = question.answers[3]

        progressTextView.text = "${currentQuestionIndex + 1}/${questions.size}"
        progressBar.progress = currentQuestionIndex + 1
        scoreTextView.text = "Bodovi: $score"

        enableAnswerButtons(true)
    }

    private fun checkAnswer(selectedIndex: Int) {
        enableAnswerButtons(false)

        val question = questions[currentQuestionIndex]

        if (selectedIndex == question.correctAnswerIndex) {
            // Točan odgovor
            score += question.points
            correctAnswers++
            timeRemaining += question.timeBonus

            Toast.makeText(this, "Točno! +${question.points} bodova, +${question.timeBonus}s", Toast.LENGTH_SHORT).show()
        } else {
            // Netočan odgovor
            val penalty = 5
            score = maxOf(0, score - penalty)
            timeRemaining = maxOf(1, timeRemaining - penalty) // Minimalno 1 sekunda

            Toast.makeText(this, "Netočno! -$penalty bodova i sekundi", Toast.LENGTH_SHORT).show()
        }

        scoreTextView.text = "Bodovi: $score"
        timerTextView.text = "Vrijeme: ${timeRemaining}s"

        // Restartaj timer sa novim vremenom
        timer?.cancel()
        startTimer()

        // Pričekaj kratko pa prijeđi na sljedeće
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            currentQuestionIndex++

            android.util.Log.d("QuizActivity", "Current index: $currentQuestionIndex, Total: ${questions.size}")

            if (currentQuestionIndex >= questions.size) {
                android.util.Log.d("QuizActivity", "Game should end now!")
                endGame()
            } else {
                showCurrentQuestion()
            }
        }, 1000)
    }

    private fun enableAnswerButtons(enabled: Boolean) {
        answer1Button.isEnabled = enabled
        answer2Button.isEnabled = enabled
        answer3Button.isEnabled = enabled
        answer4Button.isEnabled = enabled
    }

    private fun startTimer() {
        timer?.cancel()

        timer = object : CountDownTimer((timeRemaining * 1000L) + 100, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                if (!isGamePaused) {
                    timeRemaining = (millisUntilFinished / 1000).toInt()
                    timerTextView.text = "Vrijeme: ${timeRemaining}s"

                    if (timeRemaining <= 10) {
                        timerTextView.setTextColor(
                            ContextCompat.getColor(this@QuizActivity, android.R.color.holo_red_dark)
                        )
                    } else {
                        timerTextView.setTextColor(
                            ContextCompat.getColor(this@QuizActivity, android.R.color.black)
                        )
                    }
                }
            }

            override fun onFinish() {
                timeRemaining = 0
                timerTextView.text = "Vrijeme: 0s"
                endGame()
            }
        }.start()
    }

    private fun pauseGame() {
        if (!isGamePaused) {
            isGamePaused = true
            timer?.cancel()
            enableAnswerButtons(false)
            Toast.makeText(this, "Igra pauzirana zbog poziva", Toast.LENGTH_SHORT).show()
        }
    }

    private fun resumeGame() {
        if (isGamePaused) {
            isGamePaused = false
            startTimer()
            enableAnswerButtons(true)
            Toast.makeText(this, "Igra nastavljena", Toast.LENGTH_SHORT).show()
        }
    }

    private fun endGame() {
        android.util.Log.d("QuizActivity", "endGame() called!")
        timer?.cancel()

        val result = GameResult(
            userId = auth.currentUser?.uid ?: "",
            playerName = auth.currentUser?.displayName ?: "Nepoznat",
            score = score,
            correctAnswers = correctAnswers,
            totalQuestions = questions.size
        )

        android.util.Log.d("QuizActivity", "Saving result: $result")

        // Spremi rezultat
        lifecycleScope.launch {
            repository.saveGameResult(result).fold(
                onSuccess = {
                    android.util.Log.d("QuizActivity", "Result saved successfully!")
                    // Provjeri je li rezultat dobar za slavlje
                    if (score >= 75 || correctAnswers >= questions.size * 0.5) {
                        navigateToCelebration(result)
                    } else {
                        showGameOverDialog(result)
                    }
                },
                onFailure = { error ->
                    android.util.Log.e("QuizActivity", "Error saving result: ${error.message}")
                    Toast.makeText(
                        this@QuizActivity,
                        "Greška pri spremanju: ${error.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    showGameOverDialog(result)
                }
            )
        }
    }

    private fun navigateToCelebration(result: GameResult) {
        val intent = Intent(this, CelebrationActivity::class.java).apply {
            putExtra("score", result.score)
            putExtra("correctAnswers", result.correctAnswers)
            putExtra("totalQuestions", result.totalQuestions)
        }
        startActivity(intent)
        finish()
    }

    private fun showGameOverDialog(result: GameResult) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Igra završena!")
            .setMessage("Rezultat: ${result.score} bodova\nTočno: ${result.correctAnswers}/${result.totalQuestions}")
            .setPositiveButton("U redu") { _, _ ->
                finish()
            }
            .setCancelable(false)
            .show()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt("currentQuestionIndex", currentQuestionIndex)
        outState.putInt("score", score)
        outState.putInt("correctAnswers", correctAnswers)
        outState.putInt("timeRemaining", timeRemaining)
    }

    private fun restoreGameState(savedInstanceState: Bundle) {
        currentQuestionIndex = savedInstanceState.getInt("currentQuestionIndex", 0)
        score = savedInstanceState.getInt("score", 0)
        correctAnswers = savedInstanceState.getInt("correctAnswers", 0)
        timeRemaining = savedInstanceState.getInt("timeRemaining", 60)
    }

    override fun onDestroy() {
        super.onDestroy()
        timer?.cancel()
        try {
            unregisterReceiver(phoneReceiver)
        } catch (e: Exception) {
            // Receiver već unregistered
        }
    }
}