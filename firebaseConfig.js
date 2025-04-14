/**
 * LED Controller App
 * Firebase Configuration
 * Updated to use @react-native-firebase/app SDK
 */
import React from 'react';
import { Platform } from 'react-native';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_DATABASE_URL, FIREBASE_APP_ID } from '@env';

// Initialize Firebase if it hasn't been initialized already
let app;

if (!firebase.apps.length) {
    app = firebase.initializeApp({
        apiKey: FIREBASE_API_KEY,
        authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
        databaseURL: FIREBASE_DATABASE_URL,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
        appId: FIREBASE_APP_ID
    });

    // Set persistence to LOCAL (equivalent to AsyncStorage persistence)
    // This helps ensure authentication state persists across app restarts
    if (Platform.OS !== 'web') {
        auth().setPersistence(auth.Auth.Persistence.LOCAL);
    }

    // Configure database settings
    database().setLoggingEnabled(__DEV__); // Only enable logging in development

    console.log('Firebase app initialized with React Native Firebase SDK');
} else {
    app = firebase.app();
    console.log('Firebase app already initialized');
}

// Export Firebase instances
export { app, auth, database };
export default app;