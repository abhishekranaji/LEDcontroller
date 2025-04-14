/**
 * LED Controller App
 * Home Screen Component (React Native Firebase Version)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  getDeviceId,
  getDeviceInfo,
  getLEDSettings,
  updateLEDSettings,
  forgetDevice,
  getAllDevices,
  subscribeLEDSettings,
  subscribeDeviceStatus
} from '../services/firebaseApi';
import ColorSwatch from '../components/ColorSwatch';
import ColorPicker from '../components/ColorPicker';
import LightingModes from '../components/LightingModes';

// Predefined colors for the color swatch
const PREDEFINED_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFFFFF', // White
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Green (darker)
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
];

const HomeScreen = ({ route, navigation }) => {
  // Device state
  const [deviceId, setDeviceId] = useState(route.params?.deviceId || null);
  const [deviceName, setDeviceName] = useState('LED Controller');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // LED settings
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(255);
  const [mode, setMode] = useState('solid');
  const [speed, setSpeed] = useState(500);
  const [color, setColor] = useState('#FFFFFF');
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(255);

  // Always use Firebase real-time updates
  const [isRealTimeEnabled] = useState(true);

  // Set up real-time subscriptions when using Firebase
  useEffect(() => {
    let settingsUnsubscribe = null;
    let statusUnsubscribe = null;

    const setupSubscriptions = async () => {
      if (isRealTimeEnabled && deviceId) {
        // Subscribe to LED settings changes
        settingsUnsubscribe = await subscribeLEDSettings(deviceId, (settings) => {
          if (settings) {
            setIsOn(settings.is_on);
            setBrightness(settings.brightness);
            setMode(settings.mode);
            setSpeed(settings.speed);
            setRed(settings.red);
            setGreen(settings.green);
            setBlue(settings.blue);

            // Convert RGB to hex
            const hex = rgbToHex(settings.red, settings.green, settings.blue);
            setColor(hex);
          }
        });

        // Subscribe to device status changes
        statusUnsubscribe = await subscribeDeviceStatus(deviceId, (status) => {
          if (status) {
            setDeviceName(status.name || 'LED Controller');
          }
        });
      }
    };

    setupSubscriptions();

    // Clean up subscriptions when component unmounts or deviceId/mode changes
    return () => {
      if (settingsUnsubscribe) settingsUnsubscribe();
      if (statusUnsubscribe) statusUnsubscribe();
    };
  }, [deviceId, isRealTimeEnabled]);

  // Load device ID on initial render
  useEffect(() => {
    const loadDevice = async () => {
      try {
        // If no device ID passed from setup, check local storage
        if (!deviceId) {
          const allDevices = await getAllDevices();
          console.log(allDevices);

          if (!allDevices || allDevices.length === 0) {
            // No devices found, go to setup
            navigation.replace('Setup');
            return;
          }

          const storedDeviceId = allDevices[0].device_id;
          if (!storedDeviceId) {
            // No device registered, go to setup
            navigation.replace('Setup');
            return;
          }
          setDeviceId(storedDeviceId);
        }

        // Load device info
        const deviceInfo = await getDeviceInfo(deviceId);
        console.log(deviceInfo);
        if (deviceInfo) {
          setDeviceName(deviceInfo.name || 'LED Controller');
        }

        // Load current LED settings
        await refreshLEDSettings();
      } catch (error) {
        console.error('Error loading device:', error);
        Alert.alert(
          'Connection Error',
          'Could not connect to your LED controller. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDevice();
  }, [deviceId, navigation]);

  // Refresh LED settings from server
  const refreshLEDSettings = async () => {
    if (!deviceId) return;

    try {
      const settings = await getLEDSettings(deviceId);
      console.log(settings)
      if (settings) {
        setIsOn(settings.is_on);
        setBrightness(settings.brightness);
        setMode(settings.mode);
        setSpeed(settings.speed);
        setRed(settings.red);
        setGreen(settings.green);
        setBlue(settings.blue);

        // Convert RGB to hex
        const hex = rgbToHex(settings.red, settings.green, settings.blue);
        setColor(hex);
      }
    } catch (error) {
      console.error('Error loading LED settings:', error);
    }
  };

  // Update LED settings to server
  const saveLEDSettings = async () => {
    if (!deviceId) return;

    setIsUpdating(true);
    try {
      const settings = {
        is_on: isOn,
        brightness,
        mode,
        speed,
        red,
        green,
        blue
      };

      const success = await updateLEDSettings(deviceId, settings);

      if (!success) {
        throw new Error('Failed to update LED settings');
      }
    } catch (error) {
      console.error('Error updating LED settings:', error);
      Alert.alert(
        'Update Error',
        'Could not update LED settings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle color change from swatch or picker
  const handleColorChange = (selectedColor, r = null, g = null, b = null) => {
    setColor(selectedColor);

    // If RGB values are provided directly, use them
    if (r !== null && g !== null && b !== null) {
      setRed(r);
      setGreen(g);
      setBlue(b);
    } else {
      // Otherwise, convert hex to RGB
      const rgb = hexToRgb(selectedColor);
      setRed(rgb.r);
      setGreen(rgb.g);
      setBlue(rgb.b);
    }

    // Update server with new settings
    saveLEDSettings();
  };

  // Handle power toggle
  const handlePowerToggle = (value) => {
    console.log(value)
    setIsOn(value);
    saveLEDSettings();
  };

  // Handle brightness change
  const handleBrightnessChange = (value) => {
    setBrightness(value);
    saveLEDSettings();
  };

  // Handle mode change
  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    saveLEDSettings();
  };

  // Handle speed change
  const handleSpeedChange = (value) => {
    setSpeed(value);
    saveLEDSettings();
  };

  // Forget this device
  const handleForgetDevice = async () => {
    Alert.alert(
      'Forget Device',
      'Are you sure you want to remove this device from your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Forget',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const success = await forgetDevice(deviceId);
              if (success) {
                navigation.replace('Setup');
              } else {
                throw new Error('Failed to forget device');
              }
            } catch (error) {
              console.error('Error forgetting device:', error);
              Alert.alert(
                'Error',
                'Could not forget device. Please try again.',
                [{ text: 'OK' }]
              );
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Utility function to convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  // Utility function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  // Show loading indicator while fetching device data
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2089dc" />
        <Text style={styles.loadingText}>Connecting to LED Controller...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.deviceName}>{deviceName}</Text>
          <View style={styles.powerContainer}>
            <Text style={styles.powerLabel}>{isOn ? 'ON' : 'OFF'}</Text>
            <Switch
              value={isOn}
              onValueChange={handlePowerToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isOn ? '#2089dc' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Main content area - using a regular View instead of ScrollView to avoid nesting issues */}
        <View style={styles.contentContainer}>
          {/* Show controls only if power is on */}
          {isOn && (
            <>
              {/* Brightness control */}
              <View style={styles.controlSection}>
                <Text style={styles.sectionTitle}>Brightness</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{brightness}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={brightness}
                    onValueChange={handleBrightnessChange}
                    minimumTrackTintColor="#2089dc"
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor="#2089dc"
                  />
                </View>
              </View>

              {/* Lighting modes */}
              <LightingModes
                selectedMode={mode}
                onSelectMode={handleModeChange}
              />

              {/* Animation speed (only for non-solid modes) */}
              {mode !== 'solid' && (
                <View style={styles.controlSection}>
                  <Text style={styles.sectionTitle}>Animation Speed</Text>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderValue}>{speed}ms</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={50}
                      maximumValue={2000}
                      step={50}
                      value={speed}
                      onValueChange={handleSpeedChange}
                      minimumTrackTintColor="#2089dc"
                      maximumTrackTintColor="#d3d3d3"
                      thumbTintColor="#2089dc"
                    />
                  </View>
                </View>
              )}

              {/* Color selection (not used for rainbow mode) */}
              {mode !== 'rainbow' && (
                <>
                  <ColorSwatch
                    colors={PREDEFINED_COLORS}
                    selectedColor={color}
                    onSelectColor={handleColorChange}
                  />

                  <ColorPicker
                    color={color}
                    onColorChange={handleColorChange}
                  />
                </>
              )}
            </>
          )}

          {/* Connection status indicator */}
          <View style={styles.realtimeContainer}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.realtimeText}>
              Connected to Firebase
            </Text>
          </View>

          {/* Footer with update status and forget device button */}
          <View style={styles.footer}>
            {isUpdating && (
              <View style={styles.updateStatus}>
                <ActivityIndicator size="small" color="#2089dc" />
                <Text style={styles.updateText}>Updating...</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.forgetButton}
              onPress={handleForgetDevice}
            >
              <Text style={styles.forgetButtonText}>Forget This Device</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  contentContainer: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2089dc',
  },
  powerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerLabel: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  controlSection: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  realtimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  realtimeText: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateText: {
    marginLeft: 5,
    color: '#555',
  },
  forgetButton: {
    marginTop: 10,
    padding: 10,
  },
  forgetButtonText: {
    color: '#ff3b30',
    fontSize: 16,
  },
});

// Add displayName property to fix the "Cannot read property 'displayName' of undefined" error
HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;