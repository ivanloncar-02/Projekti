package com.example.githubstars.model

import com.google.gson.annotations.SerializedName

data class GitHubResponse(
    @SerializedName("items")
    val items: List<GitHubRepo>
)