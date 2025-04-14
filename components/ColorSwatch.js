/**
 * LED Controller App
 * Color Swatch Component
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, FlatList } from 'react-native';

// ColorItem component
const ColorItem = ({ color, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.swatch,
      { backgroundColor: color },
      isSelected && styles.selectedSwatch
    ]}
    onPress={onPress}
  />
);

const ColorSwatch = ({ colors, selectedColor, onSelectColor }) => {
  // Render a color swatch item
  const renderColorItem = ({ item }) => (
    <ColorItem
      color={item}
      isSelected={selectedColor === item}
      onPress={() => onSelectColor(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preset Colors</Text>
      <FlatList
        data={colors}
        renderItem={renderColorItem}
        keyExtractor={(item, index) => `color-${index}`}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={styles.colorRow}
        contentContainerStyle={styles.swatchContainer}
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
  swatchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    marginBottom: 10,
  },
  swatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#000',
  },
});

// Add displayName property to fix the "Cannot read property 'displayName' of undefined" error
ColorSwatch.displayName = 'ColorSwatch';
ColorItem.displayName = 'ColorItem';

export default ColorSwatch;