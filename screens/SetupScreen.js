/**
 * LED Controller App
 * Setup Screen Component
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView } from 'react-native';
import WiFiConfig from '../components/WiFiConfig';
import { saveDeviceId } from '../services/api';

const SetupScreen = ({ navigation }) => {
  // Handle device registration completion
  const handleDeviceRegistered = async (deviceId) => {
    // Save the device ID locally
    const saved = await saveDeviceId(deviceId);
    
    if (saved) {
      // Navigate to the home screen to control the device
      navigation.navigate('Home', { deviceId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerText}>LED Controller Setup</Text>
        <Text style={styles.subHeaderText}>
          Connect your LED controller to WiFi and register it with the app
        </Text>
        
        <View style={styles.stepsContainer}>
          <Text style={styles.stepText}>1. Put your LED controller in setup mode (press and hold the setup button for 5 seconds)</Text>
          <Text style={styles.stepText}>2. Scan for available LED controllers</Text>
          <Text style={styles.stepText}>3. Select your device and enter your WiFi details</Text>
          <Text style={styles.stepText}>4. Start controlling your LED lights</Text>
        </View>
        
        <WiFiConfig onDeviceRegistered={handleDeviceRegistered} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2089dc',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  stepText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
});

// Add displayName property to fix the "Cannot read property 'displayName' of undefined" error
SetupScreen.displayName = 'SetupScreen';

export default SetupScreen;