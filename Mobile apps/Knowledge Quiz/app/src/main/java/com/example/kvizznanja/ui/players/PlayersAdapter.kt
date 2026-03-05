package com.example.kvizznanja.ui.players

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.kvizznanja.data.model.User
import com.example.kvizznanja.R

class PlayersAdapter(
    private var players: MutableList<User>,
    private val onEditClick: (User) -> Unit,
    private val onDeleteClick: (User) -> Unit
) : RecyclerView.Adapter<PlayersAdapter.PlayerViewHolder>() {

    class PlayerViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvPlayerName)
        val btnEdit: ImageButton = view.findViewById(R.id.btnEdit)
        val btnDelete: ImageButton = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayerViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_player, parent, false)
        return PlayerViewHolder(view)
    }

    override fun onBindViewHolder(holder: PlayerViewHolder, position: Int) {
        val player = players[position]
        holder.tvName.text = player.displayName

        holder.btnEdit.setOnClickListener { onEditClick(player) }
        holder.btnDelete.setOnClickListener { onDeleteClick(player) }
    }

    override fun getItemCount() = players.size

    fun updateData(newList: List<User>) {
        players.clear()
        players.addAll(newList)
        notifyDataSetChanged()
    }
}