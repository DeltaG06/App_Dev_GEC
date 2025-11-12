package com.example.auth_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.auth_android.navigation.NavGraph
import com.example.auth_android.ui.theme.AuthAndroidTheme
import com.google.firebase.FirebaseApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseApp.initializeApp(this)

        setContent {
            AuthAndroidTheme {
                NavGraph()
            }
        }
    }
}
