package com.example.kvizznanja.data.repository

import com.example.kvizznanja.data.model.GameResult
import com.example.kvizznanja.data.model.QuizQuestion
import com.example.kvizznanja.data.model.User
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

class QuizRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val resultsCollection = firestore.collection("game_results")
    private val questionsCollection = firestore.collection("quiz_questions")
    private val usersCollection = firestore.collection("users")

    // Dohvati nasumična pitanja za kviz
    suspend fun getQuizQuestions(limit: Int = 15): Result<List<QuizQuestion>> {
        return try {
            val snapshot = questionsCollection.get().await()

            val allQuestions = snapshot.documents.mapNotNull {
                it.toObject(QuizQuestion::class.java)
            }

            val randomQuestions = allQuestions.shuffled().take(limit)

            if (randomQuestions.isEmpty()) {
                Result.failure(Exception("Nema dostupnih pitanja u bazi"))
            } else {
                Result.success(randomQuestions)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Spremi rezultat završene igre
    suspend fun saveGameResult(result: GameResult): Result<Unit> {
        return try {
            resultsCollection.add(result).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Dohvati top 10 rezultata za leaderboard (poredano po bodovima)
    suspend fun getTopResults(limit: Int = 10): Result<List<GameResult>> {
        return try {
            val snapshot = resultsCollection
                .orderBy("score", Query.Direction.DESCENDING)
                .limit(limit.toLong())
                .get()
                .await()

            val results = snapshot.documents.mapNotNull {
                it.toObject(GameResult::class.java)
            }
            Result.success(results)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Dohvati rezultate jednog specifičnog korisnika
    suspend fun getUserResults(userId: String): Result<List<GameResult>> {
        return try {
            val snapshot = resultsCollection
                .whereEqualTo("userId", userId)
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .get()
                .await()

            val results = snapshot.documents.mapNotNull {
                it.toObject(GameResult::class.java)
            }
            Result.success(results)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }


     // Dohvaća sve registrirane igrače poredane abecedno po imenu (displayName)

    suspend fun getAllPlayersAlphabetically(): Result<List<User>> {
        return try {
            val snapshot = usersCollection
                .orderBy("displayName", Query.Direction.ASCENDING)
                .get()
                .await()

            val users = snapshot.documents.mapNotNull {
                it.toObject(User::class.java)
            }
            Result.success(users)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    //sprema podatke o korisniku u bazu

    suspend fun saveUser(user: User): Result<Unit> {
        return try {
            usersCollection.document(user.uid).set(user).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}