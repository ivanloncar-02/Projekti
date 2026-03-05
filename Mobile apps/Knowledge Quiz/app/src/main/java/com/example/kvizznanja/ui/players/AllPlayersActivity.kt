package com.example.kvizznanja.ui.players

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.kvizznanja.R
import com.example.kvizznanja.data.model.User
import com.google.firebase.firestore.FirebaseFirestore

class AllPlayersActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var adapter: PlayersAdapter
    private val db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_all_players)

        recyclerView = findViewById(R.id.playersRecyclerView)
        progressBar = findViewById(R.id.progressBar)

        recyclerView.layoutManager = LinearLayoutManager(this)

        adapter = PlayersAdapter(
            mutableListOf(),
            onEditClick = { player -> showEditDialog(player) },
            onDeleteClick = { player -> showDeleteConfirmation(player) }
        )
        recyclerView.adapter = adapter

        setupRealtimeListener()
    }

    private fun setupRealtimeListener() {
        progressBar.visibility = View.VISIBLE

        db.collection("users").addSnapshotListener { snapshot, e ->
            progressBar.visibility = View.GONE

            if (e != null) {
                Toast.makeText(this, "Greška: ${e.message}", Toast.LENGTH_SHORT).show()
                return@addSnapshotListener
            }

            if (snapshot != null) {
                val list = mutableListOf<User>()
                for (doc in snapshot) {
                    val userObject = doc.toObject(User::class.java)
                    userObject?.let {
                        val userWithId = it.copy(uid = doc.id)
                        list.add(userWithId)
                    }
                }
                adapter.updateData(list)
            }
        }
    }

    private fun showEditDialog(user: User) {
        val input = EditText(this)
        input.setText(user.displayName)

        AlertDialog.Builder(this)
            .setTitle("Uredi ime")
            .setView(input)
            .setPositiveButton("Spremi") { _, _ ->
                val novoIme = input.text.toString().trim()
                if (novoIme.isNotEmpty()) {

                    db.collection("users").document(user.uid)
                        .update("displayName", novoIme)
                        .addOnSuccessListener {
                            Toast.makeText(this, "Ime ažurirano", Toast.LENGTH_SHORT).show()
                        }
                        .addOnFailureListener { err ->
                            Toast.makeText(this, "Greška: ${err.message}", Toast.LENGTH_SHORT).show()
                        }
                }
            }
            .setNegativeButton("Odustani", null)
            .show()
    }

    private fun showDeleteConfirmation(user: User) {
        AlertDialog.Builder(this)
            .setTitle("Brisanje")
            .setMessage("Želite li obrisati korisnika ${user.displayName}?")
            .setPositiveButton("Obriši") { _, _ ->
                db.collection("users").document(user.uid)
                    .delete()
                    .addOnSuccessListener {
                        Toast.makeText(this, "Obrisano", Toast.LENGTH_SHORT).show()
                    }
                    .addOnFailureListener { err ->
                        Toast.makeText(this, "Greška: ${err.message}", Toast.LENGTH_SHORT).show()
                    }
            }
            .setNegativeButton("Odustani", null)
            .show()
    }
}