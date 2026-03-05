package com.example.kvizznanja.data.model

data class QuizQuestion(
    val id: Int = 0,
    val question: String = "",
    val answers: List<String> = listOf(),
    val correctAnswerIndex: Int = 0,
    val points: Int = 10,
    val timeBonus: Int = 5
) {
    constructor() : this(0, "", listOf(), 0, 10, 5)
}