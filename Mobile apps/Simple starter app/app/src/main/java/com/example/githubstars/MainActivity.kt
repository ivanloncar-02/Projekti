package com.example.githubstars

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
// NOVI IMPORT: Klasa za dodavanje linije/separatora
import androidx.recyclerview.widget.DividerItemDecoration
import com.android.volley.Request
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import com.example.githubstars.adapter.RepoAdapter
import com.example.githubstars.model.GitHubResponse
import com.google.gson.Gson

class MainActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var repoAdapter: RepoAdapter

    private val API_URL = "https://api.github.com/search/repositories?q=stars:>100000"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        recyclerView = findViewById(R.id.recyclerView)
        repoAdapter = RepoAdapter(emptyList())
        recyclerView.adapter = repoAdapter

        // dodavanje linije izmedjuu svakog korisnika
        val dividerItemDecoration = DividerItemDecoration(
            recyclerView.context,
            DividerItemDecoration.VERTICAL
        )
        recyclerView.addItemDecoration(dividerItemDecoration)

        fetchGitHubRepos()
    }

    private fun fetchGitHubRepos() {
        val requestQueue = Volley.newRequestQueue(this)

        val stringRequest = StringRequest(
            Request.Method.GET, API_URL,
            { response ->
                // uspjesno dohvaceni podaci
                try {
                    val gson = Gson()
                    val gitHubResponse = gson.fromJson(response, GitHubResponse::class.java)

                    // azuriranje recyclerView-a novim podacima
                    repoAdapter.updateData(gitHubResponse.items)
                } catch (e: Exception) {
                    Log.e("MainActivity", "JSON Parsing Error: ${e.message}")
                    Toast.makeText(this, "Greška u parsiranju podataka.", Toast.LENGTH_LONG).show()
                }
            },
            { error ->
                // Greška prilikom mrežnog dohvaćanja
                Log.e("MainActivity", "Volley Error: ${error.message}")
                Toast.makeText(this, "Greška u mrežnom dohvaćanju: ${error.message}", Toast.LENGTH_LONG).show()
            })

        requestQueue.add(stringRequest)
    }
}