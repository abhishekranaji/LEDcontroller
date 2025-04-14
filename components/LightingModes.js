/**
 * LED Controller App
 * Lighting Modes Component
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, FlatList } from 'react-native';

const modes = [
  { id: 'solid', name: 'Solid', icon: '■' },
  { id: 'breathing', name: 'Breathing', icon: '⟿' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈' },
  { id: 'chase', name: 'Chase', icon: '↝' }
];

// Render a mode button
const ModeButton = ({ mode, isSelected, onPress }) => (
  <TouchableOpacity
    key={mode.id}
    style={[
      styles.modeButton,
      isSelected && styles.selectedMode
    ]}
    onPress={onPress}
  >
    <Text style={styles.modeIcon}>{mode.icon}</Text>
    <Text 
      style={[
        styles.modeName,
        isSelected && styles.selectedModeName
      ]}
    >
      {mode.name}
    </Text>
  </TouchableOpacity>
);

const LightingModes = ({ selectedMode, onSelectMode }) => {
  // Render each mode item
  const renderModeItem = ({ item }) => (
    <ModeButton 
      mode={item} 
      isSelected={selectedMode === item.id} 
      onPress={() => onSelectMode(item.id)} 
    />
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lighting Modes</Text>
      <FlatList
        data={modes}
        renderItem={renderModeItem}
        keyExtractor={item => item.id}
        horizontal={false}
        numColumns={4}
        scrollEnabled={false}
        contentContainerStyle={styles.modesContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    minWidth: 80,
  },
  selectedMode: {
    borderColor: '#2089dc',
    backgroundColor: '#e6f0ff',
  },
  modeIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  modeName: {
    fontSize: 12,
  },
  selectedModeName: {
    fontWeight: 'bold',
    color: '#2089dc',
  }
});

// Add displayName property to fix the "Cannot read property 'displayName' of undefined" error
LightingModes.displayName = 'LightingModes';
ModeButton.displayName = 'ModeButton';

export default LightingModes;