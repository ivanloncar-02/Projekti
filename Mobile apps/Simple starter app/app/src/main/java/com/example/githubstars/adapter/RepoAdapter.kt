package com.example.githubstars.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.githubstars.R
import com.example.githubstars.model.GitHubRepo

class RepoAdapter(private var repos: List<GitHubRepo>) :
    RecyclerView.Adapter<RepoAdapter.RepoViewHolder>() {

    class RepoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val avatar: ImageView = view.findViewById(R.id.imageViewAvatar)
        val repoName: TextView = view.findViewById(R.id.textViewRepoName)
        val stars: TextView = view.findViewById(R.id.textViewStars)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RepoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.list_item_repo, parent, false)
        return RepoViewHolder(view)
    }

        //poziva se svaki put kad neki red udje na ekran dok korisnik skrola
    override fun onBindViewHolder(holder: RepoViewHolder, position: Int) {
        val repo = repos[position]

        holder.repoName.text = repo.fullName

        holder.stars.text = repo.stars.toString()

        // Učitavanje avatara pomoću Glide-a
        Glide.with(holder.itemView.context)
            .load(repo.owner.avatarUrl)
            .circleCrop()
            .placeholder(R.drawable.ic_launcher_background) // Placeholder dok se slika učitava
            .into(holder.avatar)
    }

    override fun getItemCount() = repos.size

    //azuriranje liste podataka
    fun updateData(newRepos: List<GitHubRepo>) {
        repos = newRepos
        notifyDataSetChanged()
    }
}