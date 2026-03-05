plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    // Google Services plugin potreban za Firebase
    id("com.google.gms.google-services")
}

android {
    namespace = "com.example.kvizznanja"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.kvizznanja"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    // --- Postojeće zavisnosti iz Version Cataloga ---
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)

    // --- NOVO: Firebase (pomoću BOM-a za automatsko usklađivanje verzija) ---
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")

    // --- NOVO: Lifecycle (ViewModel i LiveData za stabilniji rad aplikacije) ---
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

    // --- NOVO: Lottie za animacije (npr. konfeti u CelebrationActivity) ---
    implementation("com.airbnb.android:lottie:6.1.0")

    // --- Testiranje ---
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}