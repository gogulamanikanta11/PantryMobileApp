# Smart Pantry Management System - API & Integration Reference

This document serves as the complete developer and API reference for the Smart Pantry Mobile App. Since the backend architecture of this application is structured as a client-side serverless application with Firestore and Firebase Auth, this reference details the data operations, authentication schemas, external integrations, and local mock services that function as the backend API of the project.

---

## Table of Contents
1. [Route Grouping Summary](#route-grouping-summary)
2. [Authentication Endpoints (Firebase Auth)](#1-authentication-endpoints-firebase-auth)
3. [User Profiles (Firestore /users)](#2-user-profiles-firestore-users)
4. [Pantry Data Operations (Firestore /pantry)](#3-pantry-data-operations-firestore-pantry)
5. [Shopping List Data Operations (Firestore /shoppinglist)](#4-shopping-list-data-operations-firestore-shoppinglist)
6. [AI & Recipe Integration Services](#5-ai--recipe-integration-services)
7. [Local Notification Service Utilities](#6-local-notification-service-utilities)

---

## Route Grouping Summary

| Route Group | Type | Base Path / SDK Method | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Firebase Auth | Auth SDK | No | Manages user registration, email login, phone/OTP verification, password reset, and logout. |
| **User Profiles** | Firestore | `/users/{uid}` | Yes | Fetches and updates demographic details (name, phone, email) associated with Firebase UID. |
| **Pantry Data** | Firestore | `/pantry` | Yes | Retrieves, adds, and removes inventory items, including expiry estimates and quantities. |
| **Shopping List** | Firestore | `/shoppingList` | Yes | Manages missing items. Supports manual entries and low-stock auto-suggestions by AI. |
| **AI Services** | External APIs | `gemini` / `openrouter` / local mock | Mixed | Connects to external large language model providers to generate recipe ideas. |

---

## 1. Authentication Endpoints (Firebase Auth)

These endpoints interface with Firebase Authentication to handle session management, validation, and account state.

### 1.1 Sign Up / Register
*   **Method:** `POST` (SDK execution)
*   **Path:** Firebase Auth `createUserWithEmailAndPassword(auth, email, password)`
*   **Description:** Creates a new credentials-based user profile on Firebase. Password must be $\ge 6$ characters.
*   **Request Parameters:**
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response Schema (Firebase UserCredential):**
    ```json
    {
      "user": {
        "uid": "aB3cd4EfGh5ijKlMnOpQrStUvWxY",
        "email": "user@example.com",
        "emailVerified": false
      }
    }
    ```
*   **Associated Files:**
    *   [register.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/register.tsx)
*   **Dependencies:** `firebase/auth`

---

### 1.2 Login with Email & Password
*   **Method:** `POST` (SDK execution)
*   **Path:** Firebase Auth `signInWithEmailAndPassword(auth, email, password)`
*   **Description:** Authenticates the user session with email and password credentials, and saves a local AsyncStorage token.
*   **Request Parameters:**
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response Schema (Firebase UserCredential):**
    ```json
    {
      "user": {
        "uid": "aB3cd4EfGh5ijKlMnOpQrStUvWxY",
        "email": "user@example.com",
        "emailVerified": false
      }
    }
    ```
*   **Associated Files:**
    *   [LoginScreen.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/screens/LoginScreen.tsx)
*   **Dependencies:** `firebase/auth`, `@react-native-async-storage/async-storage`

---

### 1.3 OTP Request (Phone Auth)
*   **Method:** `POST` (SDK execution)
*   **Path:** Firebase Auth `signInWithPhoneNumber(auth, phoneNumber, appVerifier)`
*   **Description:** Sends a 6-digit OTP verification code via SMS to the specified phone number.
*   **Request Parameters:**
    ```json
    {
      "phoneNumber": "+1234567890",
      "appVerifier": "RecaptchaVerifier" 
    }
    ```
    *(Note: `appVerifier` is required for web rendering to prevent automated abuse; mobile uses native verification safety net).*
*   **Response Schema (Firebase ConfirmationResult):**
    ```json
    {
      "verificationId": "AMJhSM...string..."
    }
    ```
*   **Associated Files:**
    *   [LoginScreen.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/screens/LoginScreen.tsx)
*   **Dependencies:** `firebase/auth`

---

### 1.4 OTP Verification (Phone Auth Confirmation)
*   **Method:** `POST` (SDK execution)
*   **Path:** `confirmationResult.confirm(otp)`
*   **Description:** Validates the user-entered 6-digit SMS verification code to sign the user in.
*   **Request Parameters:**
    ```json
    {
      "verificationCode": "123456"
    }
    ```
*   **Response Schema (Firebase UserCredential):**
    ```json
    {
      "user": {
        "uid": "aB3cd4EfGh5ijKlMnOpQrStUvWxY",
        "phoneNumber": "+1234567890"
      }
    }
    ```
*   **Associated Files:**
    *   [LoginScreen.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/screens/LoginScreen.tsx)
*   **Dependencies:** `firebase/auth`, `@react-native-async-storage/async-storage`

---

### 1.5 Send Password Reset Email
*   **Method:** `POST` (SDK execution)
*   **Path:** Firebase Auth `sendPasswordResetEmail(auth, email)`
*   **Description:** Sends a password recovery instruction email to the user.
*   **Request Parameters:**
    ```json
    {
      "email": "user@example.com"
    }
    ```
*   **Response Schema:** `void` (Fulfills with no data on successful SMTP dispatch).
*   **Associated Files:**
    *   [forgot-password.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/forgot-password.tsx)
*   **Dependencies:** `firebase/auth`

---

### 1.6 Logout Session
*   **Method:** `POST` (SDK execution)
*   **Path:** Firebase Auth `signOut(auth)`
*   **Description:** Ends the active authentication session, invalidating token and clearing local storage profile cache.
*   **Request Parameters:** None.
*   **Response Schema:** `void`.
*   **Associated Files:**
    *   [profile.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/profile.tsx)
*   **Dependencies:** `firebase/auth`, `@react-native-async-storage/async-storage`

---

## 2. User Profiles (Firestore /users)

Stores details linked to authenticated user accounts. Authorized access is implicitly handled by Firestore security rules based on user UID.

### 2.1 Fetch User Profile
*   **Method:** `GET`
*   **Path:** Firestore Document `/users/{uid}`
*   **Description:** Fetches the name and contact information associated with a Firebase authentication ID.
*   **Request Parameters:**
    *   `uid` (string, path parameter corresponding to active user UID)
*   **Response Schema:**
    ```json
    {
      "name": "Alex Mercer",
      "phone": "+1234567890",
      "email": "alex.m@example.com"
    }
    ```
*   **Associated Files:**
    *   [profile.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/profile.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

### 2.2 Update User Profile
*   **Method:** `SET` (Upsert/Merge)
*   **Path:** Firestore Document `/users/{uid}`
*   **Description:** Upserts user profile information with `{ merge: true }`.
*   **Request Parameters:**
    *   `uid` (string, path parameter)
    *   `body` (object):
        ```json
        {
          "name": "Alex Mercer",
          "phone": "+1234567890",
          "email": "alex.m@example.com"
        }
        ```
*   **Response Schema:** `void`.
*   **Associated Files:**
    *   [profile.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/profile.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

## 3. Pantry Data Operations (Firestore /pantry)

Pantry collection operations allow managing the storage, expiry status, and item quantities.

### 3.1 List Pantry Items
*   **Method:** `GET` (Query)
*   **Path:** Firestore Collection `/pantry`
*   **Description:** Retrieves all pantry items currently registered under the active app instance.
*   **Request Parameters:** None.
*   **Response Schema:** Array of objects:
    ```json
    [
      {
        "id": "docId_1",
        "name": "Milk",
        "stock": "2",
        "expiry": "2 days",
        "createdAt": "2026-06-11T08:00:00.000Z"
      },
      {
        "id": "docId_2",
        "name": "Rice",
        "stock": "5",
        "expiry": "10 days",
        "createdAt": "2026-06-11T08:00:00.000Z"
      }
    ]
    ```
*   **Associated Files:**
    *   [pantry.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/pantry.tsx)
    *   [PantryScreen.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/screens/PantryScreen.tsx)
    *   [recipes.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/recipes.tsx)
    *   [predict.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/predict.tsx)
    *   [shopping-list.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/shopping-list.tsx) (used to auto-suggest)
    *   [alerts.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/alerts.tsx)
    *   [analytics.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/analytics.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

### 3.2 Add Pantry Item
*   **Method:** `POST` (Add Document)
*   **Path:** Firestore Collection `/pantry`
*   **Description:** Appends a new item to the pantry collection.
*   **Request Parameters (Body):**
    ```json
    {
      "name": "Bread",
      "stock": "1",
      "expiry": "3 days",
      "createdAt": "2026-06-11T08:05:00.000Z"
    }
    ```
*   **Response Schema (Firebase DocumentReference):**
    ```json
    {
      "id": "newDocIdGeneratedByFirestore"
    }
    ```
*   **Associated Files:**
    *   [additem.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/additem.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

### 3.3 Delete Pantry Item
*   **Method:** `DELETE`
*   **Path:** Firestore Document `/pantry/{id}`
*   **Description:** Deletes a pantry document from the database collection.
*   **Request Parameters:**
    *   `id` (string, path parameter corresponding to Document ID)
*   **Response Schema:** `void`.
*   **Associated Files:**
    *   [PantryScreen.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/screens/PantryScreen.tsx)
    *   [pantry.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/pantry.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

## 4. Shopping List Data Operations (Firestore /shoppinglist)

Supports logging items that are currently out of stock or needed for household usage.

### 4.1 List Shopping List Items
*   **Method:** `GET`
*   **Path:** Firestore Collection `/shoppingList`
*   **Description:** Retrieves all items on the current shopping list.
*   **Request Parameters:** None.
*   **Response Schema:** Array of objects:
    ```json
    [
      {
        "id": "shopDocId_1",
        "name": "Apples",
        "checked": false,
        "createdAt": "2026-06-11T08:00:00.000Z",
        "autoGenerated": false
      }
    ]
    ```
*   **Associated Files:**
    *   [shopping-list.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/shopping-list.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

### 4.2 Add Shopping List Item
*   **Method:** `POST`
*   **Path:** Firestore Collection `/shoppingList`
*   **Description:** Appends a new item to the shopping list. Supports manual user creation or automated insertion via low stock checks.
*   **Request Parameters (Body):**
    ```json
    {
      "name": "Milk",
      "checked": false,
      "createdAt": "2026-06-11T08:00:00.000Z",
      "autoGenerated": true
    }
    ```
*   **Response Schema (Firebase DocumentReference):**
    ```json
    {
      "id": "newDocId"
    }
    ```
*   **Associated Files:**
    *   [shopping-list.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/shopping-list.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

### 4.3 Delete Shopping List Item
*   **Method:** `DELETE`
*   **Path:** Firestore Document `/shoppingList/{id}`
*   **Description:** Deletes the specified shopping list item from the database.
*   **Request Parameters:**
    *   `id` (string, path parameter)
*   **Response Schema:** `void`.
*   **Associated Files:**
    *   [shopping-list.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/shopping-list.tsx)
*   **Dependencies:** `firebase/firestore`, `backend/firebase/config.ts`

---

## 5. AI & Recipe Integration Services

These services query external large language model providers or run local evaluation rules to suggest kitchen recipes based on pantry items.

### 5.1 OpenRouter Recipe Generation
*   **Method:** `POST` (External HTTP Call)
*   **Path:** `https://openrouter.ai/api/v1/chat/completions`
*   **Description:** Generates a list of 5 recipes using active pantry ingredients. Prompts specifically ask for Indian recipes, Curries, Rice Dishes, or Snacks.
*   **Headers:**
    *   `Authorization: Bearer sk-or-v1-9201...[redacted]`
    *   `Content-Type: application/json`
*   **Request Payload:**
    ```json
    {
      "model": "openai/gpt-3.5-turbo",
      "messages": [
        { "role": "system", "content": "You are a professional chef who suggests recipes..." },
        { "role": "user", "content": "Available Pantry Ingredients: Milk, Rice. Suggest 5 recipes..." }
      ]
    }
    ```
*   **Response Schema (OpenRouter chat completions):**
    ```json
    {
      "id": "gen-...",
      "choices": [
        {
          "message": {
            "role": "assistant",
            "content": "🍽 Kheer (Rice Pudding)\n⏱ Cooking Time: 30 mins\n🥕 Ingredients Used: Rice, Milk..."
          }
        }
      ]
    }
    ```
*   **Associated Files:**
    *   `backend/services/openrouter.ts` (impl)
    *   [recipes.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/recipes.tsx) (invocation)
*   **Dependencies:** `axios`

---

### 5.2 Google Gemini Recipe Generation
*   **Method:** `POST` (SDK execution)
*   **Path:** Google Generative AI - `gemini-2.0-flash`
*   **Description:** Uses the Google Generative AI SDK to prompt a recipe suggestions list based on the inputs array.
*   **Request Parameter:**
    *   `ingredients` (array of strings)
*   **Response Schema:** String output describing 3 suggested recipes with ingredients and instructions.
*   **Associated Files:**
    *   `backend/services/gemini.ts` (impl)
*   **Dependencies:** `@google/generative-ai`

---

### 5.3 HuggingFace Recipe Generation (Fallback Service)
*   **Method:** Local Code Check (Mock service)
*   **Description:** Runs matching conditions locally to respond instantly with custom formatted recipes if common combinations are detected (e.g. egg & rice, banana & milk, egg & bread). Fallback returns Mixed Veg stir fry recipes.
*   **Request Parameter:**
    *   `ingredients` (array of strings)
*   **Response Schema:** Formatted string content containing recipe instructions.
*   **Associated Files:**
    *   `backend/services/huggingface.ts`
*   **Dependencies:** None.

---

## 6. Local Notification Service Utilities

Schedules system/OS alerts based on proximity to item expirations.

### 6.1 Schedule Expiration Alert
*   **Method:** SDK Call
*   **Path:** Expo Notifications `scheduleNotificationAsync`
*   **Description:** Triggers a device notification telling the user that pantry items are expiring soon.
*   **Trigger Condition:** Set to issue 5 seconds after invocation.
*   **Request Payload (SDK configuration):**
    ```json
    {
      "content": {
        "title": "Smart Pantry AI",
        "body": "Your pantry item is expiring soon!"
      },
      "trigger": { "seconds": 5 }
    }
    ```
*   **Response Schema:** `void`.
*   **Associated Files:**
    *   `backend/utils/notifications.ts` (impl)
    *   [alerts.tsx](file:///c:/Users/manik/Downloads/PantryMobileApp/app/alerts.tsx) (invocation)
*   **Dependencies:** `expo-notifications`
