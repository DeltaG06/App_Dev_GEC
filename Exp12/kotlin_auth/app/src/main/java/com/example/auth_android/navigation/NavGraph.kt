package com.example.auth_android.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.auth_android.auth.LoginScreen
import com.example.auth_android.auth.SignupScreen
import com.example.auth_android.home.HomeScreen
import com.example.auth_android.profile.ProfileScreen
import com.google.firebase.auth.FirebaseAuth

@Composable
fun NavGraph() {
    val navController: NavHostController = rememberNavController()
    val startDestination = if (FirebaseAuth.getInstance().currentUser != null) "home" else "login"
    NavHost(navController = navController, startDestination = "login") {
        composable("login") { LoginScreen(navController) }
        composable("signup") { SignupScreen(navController) }
        composable("home") { HomeScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
    }
}
