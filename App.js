/**
 * LED Controller App
 * Main Application Component (Firebase Version)
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import SetupScreen from './screens/SetupScreen';
import LoginScreen from './screens/LoginScreen';
// Import Firebase configuration and auth
import app, { auth, database } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Create navigation stack
const Stack = createStackNavigator();

// Auth Stack for non-authenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// App Stack for authenticated users
const AppStack = () => {
  const headerOptions = {
    headerStyle: {
      backgroundColor: '#2089dc',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={({ navigation }) => ({ 
          title: 'LED Controller',
          ...headerOptions,
          headerRight: () => (
            <LogoutButton navigation={navigation} />
          ),
        })}
      />
      <Stack.Screen 
        name="Setup" 
        component={SetupScreen} 
        options={{ 
          title: 'Device Setup',
          ...headerOptions
        }}
      />
    </Stack.Navigator>
  );
};

// Logout button component
const LogoutButton = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      // The AuthState listener will handle navigation
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An error occurred while trying to log out.');
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleLogout}
      style={{ marginRight: 15 }}
    >
      <Text style={{ color: 'white', fontSize: 16 }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default function App() {
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  // Check Firebase configuration on app start
  useEffect(() => {
    const checkFirebaseConfig = async () => {
      try {
        // Check if Firebase is properly configured
        const config = app.options;
        const isDefaultConfig = 
          !config.apiKey || 
          !config.databaseURL || 
          !config.projectId;
        
        if (isDefaultConfig) {
          // Alert user if Firebase is not configured
          Alert.alert(
            'Firebase Configuration Required',
            'Please check your Firebase credentials in .env file or environment variables',
            [{ text: 'OK' }]
          );
          setFirebaseConfigured(false);
        } else {
          console.log('Firebase configuration verified');
          setFirebaseConfigured(true);
        }
      } catch (error) {
        console.error('Error checking Firebase config:', error);
      }
    };
    
    checkFirebaseConfig();
  }, []);

  // Show loading screen while initializing
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2089dc" />
      </View>
    );
  }

  // If not configured, keep showing Firebase config alert, but render the app
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});