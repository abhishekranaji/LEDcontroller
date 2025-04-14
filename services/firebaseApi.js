/**
 * LED Controller App
 * Firebase API Service Module
 * Updated to use @react-native-firebase/app SDK
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, database } from '../firebaseConfig';
import { Platform } from 'react-native';

// Path to devices in the Firebase Realtime Database
const DEVICES_PATH = 'devices';

// Ensure authentication
const ensureAuthentication = async () => {
    try {
        // If not already signed in, sign in anonymously
        if (!auth().currentUser) {
            await auth().signInAnonymously();
            console.log('Anonymous authentication successful');
        }
        return true;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
};

/**
 * Save device ID locally
 * @param {string} deviceId - The ID of the device
 */
export const saveDeviceId = async (deviceId) => {
    try {
        await AsyncStorage.setItem('deviceId', deviceId);
        console.log('Saved device ID to AsyncStorage:', deviceId);
        return true;
    } catch (error) {
        console.error('Error saving device ID:', error);
        return false;
    }
};

/**
 * Get stored device ID
 * @returns {Promise<string|null>} - The device ID or null if not found
 */
export const getDeviceId = async () => {
    try {
        const deviceId = await AsyncStorage.getItem('deviceId');
        console.log('Retrieved device ID from AsyncStorage:', deviceId);
        return deviceId;
    } catch (error) {
        console.error('Error getting device ID:', error);
        return null;
    }
};

/**
 * Remove stored device ID (disconnect)
 */
export const forgetDevice = async (deviceId) => {
    try {
        // Remove from local storage
        await AsyncStorage.removeItem('deviceId');

        // Optionally, you can also remove the device from Firebase
        // Uncomment the below code if you want to remove from Firebase as well
        /*
        if (deviceId) {
          await database().ref(`${DEVICES_PATH}/${deviceId}`).remove();
        }
        */

        console.log('Removed device ID from AsyncStorage');
        return true;
    } catch (error) {
        console.error('Error removing device ID:', error);
        return false;
    }
};

/**
 * Get all devices from Firebase
 * @returns {Promise<Array|null>} - Array of devices or null if error
 */
export const getAllDevices = async () => {
    try {
        // Ensure we're authenticated before accessing Firebase
        const authenticated = await ensureAuthentication();
        if (!authenticated) {
            console.error('Failed to authenticate');
            return [];
        }

        console.log('Getting all devices from Firebase');
        const snapshot = await database().ref(DEVICES_PATH).orderByKey().once('value');

        if (snapshot.exists()) {
            const devicesData = snapshot.val();
            const devices = Object.keys(devicesData).map(key => ({
                id: key,
                name: `ESP8266-${key.substring(0, 8)}`,
                device_id: key,
                status: devicesData[key].status || {}
            }));

            console.log('Retrieved devices from Firebase:', devices);
            return devices;
        }

        console.log('No devices found in Firebase');
        return [];
    } catch (error) {
        console.error('Error getting all devices:', error);
        return [];
    }
};

/**
 * Register a new device
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<boolean>} - Success status
 */
export const registerDevice = async (deviceId) => {
    try {
        // Ensure we're authenticated before accessing Firebase
        const authenticated = await ensureAuthentication();
        if (!authenticated) {
            console.error('Failed to authenticate');
            return false;
        }

        // Create initial device structure in Firebase
        await database().ref(`${DEVICES_PATH}/${deviceId}`).set({
            settings: {
                isOn: false,
                brightness: 255,
                red: 255,
                green: 0,
                blue: 0,
                mode: 'solid',
                speed: 500
            },
            status: {
                online: false,
                lastSeen: database.ServerValue.TIMESTAMP
            }
        });

        // Save locally
        await saveDeviceId(deviceId);

        console.log('Device registered successfully:', deviceId);
        return true;
    } catch (error) {
        console.error('Error registering device:', error);
        return false;
    }
};

/**
 * Get device information
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<Object|null>} - Device info or null if error
 */
export const getDeviceInfo = async (deviceId) => {
    try {
        if (!deviceId) {
            console.error('No device ID provided');
            return null;
        }

        // Ensure we're authenticated before accessing Firebase
        const authenticated = await ensureAuthentication();
        if (!authenticated) {
            console.error('Failed to authenticate');
            return null;
        }

        const snapshot = await database().ref(`${DEVICES_PATH}/${deviceId}`).once('value');

        if (snapshot.exists()) {
            const deviceData = snapshot.val();
            // Format it to match the expected format in your app
            const formattedInfo = {
                id: deviceId,
                device_id: deviceId,
                name: `ESP8266-${deviceId.substring(0, 8)}`,
                ip_address: deviceData.status?.ipAddress || '',
                free_heap: deviceData.status?.freeHeap || 0,
                uptime: deviceData.status?.uptime || 0,
                online: deviceData.status?.online || false,
                last_seen: deviceData.status?.lastSeen || Date.now()
            };

            console.log('Retrieved device info from Firebase:', formattedInfo);
            return formattedInfo;
        }

        console.log('Device info not found in Firebase');
        return null;
    } catch (error) {
        console.error('Error getting device info:', error);
        return null;
    }
};

/**
 * Get LED settings for a device
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<Object|null>} - LED settings or null if error
 */
export const getLEDSettings = async (deviceId) => {
    try {
        if (!deviceId) {
            console.error('No device ID provided');
            return null;
        }

        // Ensure we're authenticated before accessing Firebase
        const authenticated = await ensureAuthentication();
        if (!authenticated) {
            console.error('Failed to authenticate');
            return null;
        }

        const snapshot = await database().ref(`${DEVICES_PATH}/${deviceId}/settings`).once('value');

        if (snapshot.exists()) {
            const settings = snapshot.val();

            // Format to match the expected API format
            const formattedSettings = {
                isOn: settings.isOn,
                brightness: settings.brightness,
                red: settings.red,
                green: settings.green,
                blue: settings.blue,
                mode: settings.mode,
                speed: settings.speed
            };

            console.log('Retrieved LED settings from Firebase:', formattedSettings);
            return formattedSettings;
        }

        console.log('LED settings not found in Firebase');
        // Return default settings if none found
        return {
            isOn: false,
            brightness: 255,
            red: 255,
            green: 0,
            blue: 0,
            mode: 'solid',
            speed: 500
        };
    } catch (error) {
        console.error('Error getting LED settings:', error);
        return null;
    }
};

/**
 * Update LED settings for a device
 * @param {string} deviceId - The ID of the device
 * @param {Object} settings - The settings to update
 * @returns {Promise<boolean>} - True if successful, false if error
 */
export const updateLEDSettings = async (deviceId, settings) => {
    try {
        if (!deviceId) {
            console.error('No device ID provided');
            return false;
        }

        // Ensure we're authenticated before accessing Firebase
        const authenticated = await ensureAuthentication();
        if (!authenticated) {
            console.error('Failed to authenticate');
            return false;
        }

        await database().ref(`${DEVICES_PATH}/${deviceId}/settings`).update(settings);

        console.log('Updated LED settings in Firebase:', settings);
        return true;
    } catch (error) {
        console.error('Error updating LED settings:', error);
        return false;
    }
};

/**
 * Subscribe to LED settings changes
 * @param {string} deviceId - The ID of the device
 * @param {Function} callback - Function to call with updated settings
 * @returns {Function} - Unsubscribe function
 */
export const subscribeLEDSettings = (deviceId, callback) => {
    if (!deviceId) {
        console.error('No device ID provided');
        return () => { };
    }

    const reference = database().ref(`${DEVICES_PATH}/${deviceId}/settings`);

    // Set up the value event listener
    const onValueChange = reference.on('value', snapshot => {
        if (snapshot.exists()) {
            const settings = snapshot.val();
            callback(settings);
        }
    });

    // Return unsubscribe function
    return () => reference.off('value', onValueChange);
};

/**
 * Subscribe to device status changes
 * @param {string} deviceId - The ID of the device
 * @param {Function} callback - Function to call with updated status
 * @returns {Function} - Unsubscribe function
 */
export const subscribeDeviceStatus = (deviceId, callback) => {
    if (!deviceId) {
        console.error('No device ID provided');
        return () => { };
    }

    const reference = database().ref(`${DEVICES_PATH}/${deviceId}/status`);

    // Set up the value event listener
    const onValueChange = reference.on('value', snapshot => {
        if (snapshot.exists()) {
            const status = snapshot.val();
            // Format to match your app's expected format
            const formattedStatus = {
                id: deviceId,
                device_id: deviceId,
                name: `ESP8266-${deviceId.substring(0, 8)}`,
                ip_address: status.ipAddress || '',
                free_heap: status.freeHeap || 0,
                uptime: status.uptime || 0,
                online: status.online || false,
                last_seen: status.lastSeen || Date.now()
            };

            callback(formattedStatus);
        }
    });

    // Return unsubscribe function
    return () => reference.off('value', onValueChange);
};

/**
 * Check if device exists in Firebase
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<boolean>} - True if device exists, false otherwise
 */
export const checkDeviceExists = async (deviceId) => {
    try {
        if (!deviceId) {
            return false;
        }

        // Ensure we're authenticated before accessing Firebase
        const authenticated = await ensureAuthentication();
        if (!authenticated) {
            console.error('Failed to authenticate');
            return false;
        }

        const snapshot = await database().ref(`${DEVICES_PATH}/${deviceId}`).once('value');

        return snapshot.exists();
    } catch (error) {
        console.error('Error checking if device exists:', error);
        return false;
    }
};

/**
 * Find devices in setup mode
 * This is a simulation for Firebase since we can't scan the network directly
 * In a real implementation, you might need to use BLE or another discovery method
 * @returns {Promise<Array>} - Array of available devices
 */
export const findDevicesInSetupMode = async () => {
    try {
        // Generate a random device ID for demonstration
        // In a real app, this would come from scanning the network or BLE
        const randomId = Math.random().toString(36).substring(2, 10);

        // Simulate device discovery
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

        // Create a mock device with a unique ID
        const mockDevices = [
            {
                id: randomId,
                name: `ESP8266-${randomId.substring(0, 4)}`,
                ip_address: Platform.OS === 'ios' ? '10.0.0.1' : '192.168.4.1',
                rssi: -50 - Math.floor(Math.random() * 30) // Random signal strength
            }
        ];

        return mockDevices;
    } catch (error) {
        console.error('Error finding devices in setup mode:', error);
        return [];
    }
};