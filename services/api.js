/**
 * LED Controller App
 * API Service Module
 */
import { Platform, PermissionsAndroid } from 'react-native';

const DEVICE_PREFIX = 'ESP-LED-Setup';
// API base URL - Using the local server running on port 5000
const API_BASE_URL = 'http://192.168.1.3:5000/api';

/**
 * Save device ID locally
 * @param {string} deviceId - The ID of the device
 */
export const saveDeviceId = async (deviceId) => {
  try {
    // Use AsyncStorage for React Native
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('deviceId', deviceId);
    return true;
  } catch (error) {
    console.error('Error saving device ID:', error);
    return false;
  }
};

/**
 * Get all devices from the server
 * @returns {Promise<Array|null>} - Array of devices or null if error
 */
export const getAllDevices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const devices = await response.json();
    console.log('Retrieved devices from server:', devices);
    return devices;
  } catch (error) {
    console.error('Error getting all devices:', error);
    return null;
  }
};
/**
 * Get stored device ID
 * @returns {Promise<string|null>} - The device ID or null if not found
 */
export const getDeviceId = async () => {
  try {
    // Import AsyncStorage properly to avoid reference errors
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // Get the device ID from AsyncStorage
    const deviceId = await AsyncStorage.getItem('deviceId');
    console.log('Retrieved device ID from AsyncStorage:', deviceId);
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Log the specific error for debugging
    if (error instanceof Error) {
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
};

/**
 * Find devices that are in setup mode
 * @returns {Promise<Array>} - Array of devices in setup mode
 */
export const findDevicesInSetupMode = async () => {
  try {
    console.log('Running in pure React Native - native WiFi features expected');

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      let WifiManager;

      try {
        WifiManager = require('react-native-wifi-reborn').default;
        console.log('WifiManager loaded:', Object.keys(WifiManager));
      } catch (e) {
        console.warn('Failed to load WifiManager module:', e);
        return getSimulatedDevices();
      }

      // Validate method existence
      if (typeof WifiManager.loadWifiList !== 'function') {
        console.warn('WifiManager missing loadWifiList()');
        return getSimulatedDevices();
      }

      // Request location permission (Android only)
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location permission required',
            message: 'This app needs location permission to scan WiFi networks.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Location permission denied');
          return getSimulatedDevices();
        }
      }

      try {
        // Scan and get WiFi list
        const wifiList = await WifiManager.loadWifiList();
        console.log(`Scanned ${wifiList.length} WiFi networks`);

        const devices = wifiList
          .filter(n => n.SSID && n.SSID.includes(DEVICE_PREFIX))
          .map(n => ({
            id: n.BSSID || n.SSID, // BSSID is better as unique ID
            name: n.SSID,
            rssi: n.level,
          }));

        if (devices.length > 0) {
          console.log(devices)
          console.log(`Found ${devices.length} matching devices`);
          return devices;
        } else {
          console.log('No matching devices found');
          return getSimulatedDevices(); // Optional fallback
        }
      } catch (err) {
        console.warn('WiFi scan error:', err);
        return getSimulatedDevices();
      }
    }

    console.log('Not on a supported mobile platform. Using simulated devices.');
    return getSimulatedDevices();
  } catch (err) {
    console.error('Unexpected error in findDevicesInSetupMode():', err);
    return getSimulatedDevices();
  }
};

/**
 * Helper function to get simulated devices for development or when WiFi scanning isn't available
 * @returns {Array} Array of simulated devices
 */
function getSimulatedDevices() {
  console.log('Returning simulated ESP8266 devices for development/testing');
  return [
    {
      id: 'ESP8266-0070E14E',
      name: 'ESP-LED-Setup',
      rssi: -45
    },
    {
      id: 'ESP8266-AA22BB33',
      name: 'ESP-LED-Setup-2',
      rssi: -60
    }
  ];
}

/**
 * Register a new device
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<boolean>} - Success status
 */
export const registerDevice = async (deviceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_id: deviceId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error registering device:', error);
    return false;
  }
};

/**
 * Update LED control settings for a device
 * @param {string} deviceId - The ID of the device
 * @param {Object} settings - The LED control settings
 * @returns {Promise<boolean>} - Success status
 */
export const updateLEDSettings = async (deviceId, settings) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating LED settings:', error);
    return false;
  }
};

/**
 * Get device LED settings
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<Object|null>} - Device LED settings or null if error
 */
export const getLEDSettings = async (deviceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/settings`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting LED settings:', error);
    return null;
  }
};

/**
 * Forget a device (remove locally and from server)
 * @param {string} deviceId - The ID of the device to forget
 * @returns {Promise<boolean>} - Success status
 */
export const forgetDevice = async (deviceId) => {
  try {
    // Remove locally
    // const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // await AsyncStorage.removeItem('deviceId');
    
    // Remove from server
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error forgetting device:', error);
    return false;
  }
};

/**
 * Get device information
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<Object|null>} - Device data or null if not found
 */
export const getDeviceInfo = async (deviceId) => {
  try {
    console.log(deviceId)
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
};