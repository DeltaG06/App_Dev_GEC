🍽️ SmartDine — Smart Restaurant Ordering System

SmartDine is a modern digital restaurant ordering system designed to replace traditional waiters and manual menu handling. Customers can scan a QR code placed on their table, browse a digital menu, place orders, and view order status in real-time. The kitchen receives live incoming orders, while the admin panel controls menu items, pricing, and user roles.

This project demonstrates the integration of mobile app development, cloud Firestore backend, and a real-time smart dining system.

📌 Table of Contents

Project Overview

Problem Statement

Objectives

Features

System Architecture

Tech Stack

Screens & Workflows

Database Structure

Installation Guide

Testing & APK Build

Future Enhancements

Screenshots (Optional)

Team & Credits

🧠 Project Overview

SmartDine eliminates the need for physical menus and manual ordering. Each dining table has a unique QR code. Once scanned, the customer accesses the restaurant menu, adds items to the cart, and confirms their order. Orders are automatically sent to the Kitchen Dashboard, improving efficiency and reducing waiting time.

❗ Problem Statement

Traditional restaurant ordering systems involve:

Manual waiter calling

Delayed order processing

Wrong/forgotten orders

No digital tracking of order status

These lead to decreased customer satisfaction and inefficient restaurant workflow.

🎯 Objectives

Digitalize restaurant ordering with a mobile-first experience

Reduce dependency on staff

Improve order accuracy and speed

Provide separate roles for Admin, Kitchen, and Customer

Deliver real-time updates with a cloud backend

🚀 Features
👤 Customer Side

Scan QR to unlock table

Browse menu with images & details

Add/remove menu items from cart

Place orders directly

View order status (Pending → Preparing → Served)

🛠 Admin Panel

Add / update / delete menu items

Generate downloadable QR for tables

View/manage all user accounts

Toggle VIP access

🔪 Kitchen Dashboard

Live incoming order stream

Update order status (Pending → Preparing → Ready → Served)

🔐 Authentication & Role-Based Access

Admin

Kitchen Staff

Customer (Normal / VIP)

🏗 System Architecture
User (App) ---> Firebase Auth ---> Firestore DB 
        ↘ QR Scan ↙            ↘ Real-time Orders
Admin Panel ------------------> Manage Menus/Users
Kitchen App ------------------> Live Order Dashboard

🛠 Tech Stack
Area	Technology
Frontend	React Native (CLI) + TypeScript
Backend	Firebase Firestore
Auth	Firebase Authentication
QR	react-native-vision-camera + QR Frame Processor
State Mgmt	React Context
Build	Gradle + Signed Release Keystore
📱 Screens & Workflows

Login / Signup

Home Dashboard

Menu Screen

Cart & Order Confirmation

QR Scanner

Admin Panel

Kitchen Live Orders Panel

📂 Database Structure (Firestore)
users
 └─ uid
       email
       role (admin/kitchen/customer)
       premium (true/false)

menuItems
 └─ itemId
       name, price, category, imageURL

orders
 └─ orderId
       tableNumber
       userId
       items[]
       totalPrice
       status (pending/preparing/served)

qrTables
 └─ qrId
       tableNumber
       code

🧩 Installation Guide
git clone https://github.com/YOUR_USERNAME/SmartDine.git
cd SmartDine
yarn install


Add Firebase configuration at:

/services/firebase.ts
/android/app/google-services.json


Run app:

yarn android

📦 Build APK
cd android
./gradlew assembleRelease


APK Output:

android/app/build/outputs/apk/release/app-release.apk

🚧 Future Enhancements

Online UPI payments

Table reservation system

Push notifications

Analytics dashboard

AI-powered menu recommendations

📸 Screenshots (Optional)

Add screenshots later before submission

👥 Team & Credits
Role	Name
Developer	Gaurav Parker
Guide	(SIR Name)
Institute	Goa College of Engineering
Year	2025
💡 Summary

SmartDine solves the delays and inefficiencies of traditional restaurants with a modern, scalable digital ordering platform using mobile tech and cloud backend. It is modular, extensible, and ready for deployment in real restaurants.