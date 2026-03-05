package com.example.githubstars.model

import com.google.gson.annotations.SerializedName

data class GitHubRepo(
    @SerializedName("full_name")
    val fullName: String,

    @SerializedName("stargazers_count")
    val stars: Int,

    @SerializedName("owner")
    val owner: Owner
)