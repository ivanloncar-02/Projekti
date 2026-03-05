package com.example.kvizznanja.data.model

import com.google.firebase.Timestamp
import com.google.firebase.firestore.ServerTimestamp

data class GameResult(
    val userId: String = "",
    val playerName: String = "",
    val score: Int = 0,
    val correctAnswers: Int = 0,
    val totalQuestions: Int = 0,
    @ServerTimestamp
    val timestamp: Timestamp? = null
) {
    constructor() : this("", "", 0, 0, 0, null)
}