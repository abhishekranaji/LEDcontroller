import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { findDevicesInSetupMode, registerDevice } from '../services/firebaseApi';
import WifiManager from 'react-native-wifi-reborn';

function WiFiConfig({ onDeviceRegistered }) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission Required',
        message: 'We need location access to scan and connect to WiFi networks.',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const scanForDevices = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is needed to scan WiFi.');
        return;
      }
    }

    setIsScanning(true);
    try {
      const foundDevices = await findDevicesInSetupMode();
      setDevices(foundDevices);
      if (!foundDevices.length) {
        Alert.alert('No Devices Found', 'Ensure the controller is in setup mode.');
      }
    } catch (error) {
      Alert.alert('Scan Error', error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDeviceWiFi = async (deviceSSID) => {
    try {
      const currentSSID = await WifiManager.getCurrentWifiSSID();
      console.log('Current SSID:', currentSSID);

      if (currentSSID !== deviceSSID) {
        const connected = await WifiManager.connectToProtectedWifiSSID({
          ssid: deviceSSID,
          password: 'ledcontrol',
          isWEP: false,
          isHidden: false,
          timeout: 30, // Optional, in seconds
        });
  
      } 
     
      // console.log('Connected to:', connected);

      const newSSID = await WifiManager.getCurrentWifiSSID();
      console.log(newSSID)
      return newSSID === deviceSSID;
    } catch (err) {
      console.error('WiFi connection error:', err);
      Alert.alert('WiFi Connection Failed', 'Could not connect to the controller. Try manually or check permissions.');
      return false;
    }
  };

  const connectToWiFi = async () => {
    if (!selectedDevice || !ssid) {
      Alert.alert('Missing Info', 'Select a device and enter SSID.');
      return;
    }
  
    setIsConnecting(true);
  
    try {
      const deviceSSID = 'ESP-LED-Setup';
      const connected = await connectToDeviceWiFi(deviceSSID);
      if (!connected) throw new Error('Failed to connect to device WiFi');
  
      const response = await fetch('http://192.168.4.1/wifi/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid, password }),
      });
  
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid JSON response from device');
      }
  
      if (!data.success) {
        throw new Error(data.message || 'Unknown error from device');
      }
  
      await new Promise((res) => setTimeout(res, 3000));
      const success = await registerDevice(selectedDevice.id);
  
      if (success) {
        Alert.alert('Setup Complete', 'Device connected and registered.');
        onDeviceRegistered(selectedDevice.id);
      } else {
        throw new Error('Failed to register device with server');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsConnecting(false);
    }
  };
  

  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        selectedDevice?.id === item.id && styles.selectedDevice
      ]}
      onPress={() => setSelectedDevice(item)}
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
      <Text style={styles.deviceSignal}>Signal: {item.rssi} dBm</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Setup a New LED Controller</Text>

        <TouchableOpacity style={styles.scanButton} onPress={scanForDevices} disabled={isScanning}>
          <Text style={styles.buttonText}>{isScanning ? 'Scanning...' : 'Scan for Devices'}</Text>
          {isScanning && <ActivityIndicator style={styles.spinner} color="#fff" />}
        </TouchableOpacity>

        {devices.length > 0 && (
          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            style={styles.deviceList}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {selectedDevice && (
          <View style={styles.wifiForm}>
            <Text style={styles.selectedDeviceText}>Selected: {selectedDevice.name}</Text>

            <TextInput
              style={styles.input}
              placeholder="WiFi SSID"
              value={ssid}
              onChangeText={setSsid}
            />
            <TextInput
              style={styles.input}
              placeholder="WiFi Password"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.connectButton} onPress={connectToWiFi} disabled={isConnecting}>
              <Text style={styles.buttonText}>{isConnecting ? 'Connecting...' : 'Connect Device'}</Text>
              {isConnecting && <ActivityIndicator style={styles.spinner} color="#fff" />}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 15, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  scanButton: { backgroundColor: '#2089dc', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  spinner: { marginLeft: 10 },
  deviceList: { marginVertical: 20 },
  deviceItem: { padding: 12, borderRadius: 8, borderColor: '#ccc', borderWidth: 1, marginBottom: 10 },
  selectedDevice: { backgroundColor: '#e0f0ff', borderColor: '#2089dc' },
  deviceName: { fontWeight: 'bold', fontSize: 16 },
  deviceId: { color: '#555' },
  deviceSignal: { color: '#555' },
  wifiForm: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8 },
  selectedDeviceText: { marginBottom: 10, fontSize: 16 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 6, marginBottom: 10, borderColor: '#ccc', borderWidth: 1 },
  connectButton: { backgroundColor: '#2089dc', padding: 12, borderRadius: 8, alignItems: 'center' },
});

WiFiConfig.displayName = 'WiFiConfig';
export default WiFiConfig;
