/**
 * LED Controller App
 * Color Picker Component
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

const ColorPicker = ({ color, onColorChange }) => {
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(255);
  const [hexColor, setHexColor] = useState('#FFFFFF');

  // Convert RGB to Hex
  function rgbToHex(rgb) {
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase();
  }

  // Convert Hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  // Initialize from props
  useEffect(() => {
    if (color) {
      const rgb = hexToRgb(color);
      setRed(rgb.r);
      setGreen(rgb.g);
      setBlue(rgb.b);
      setHexColor(color);
    }
  }, [color]);

  // Update RGB when hex changes
  const handleHexChange = (text) => {
    // Add # if it's not there
    const formattedHex = text.startsWith('#') ? text : `#${text}`;
    setHexColor(formattedHex);
    
    // Only update RGB if it's a valid hex
    if (/^#[0-9A-F]{6}$/i.test(formattedHex)) {
      const rgb = hexToRgb(formattedHex);
      setRed(rgb.r);
      setGreen(rgb.g);
      setBlue(rgb.b);

      // Notify parent
      onColorChange(formattedHex, rgb.r, rgb.g, rgb.b);
    }
  };

  // Update hex when RGB changes
  const handleRGBChange = (r, g, b) => {
    setRed(r);
    setGreen(g);
    setBlue(b);
    
    const hex = rgbToHex({ r, g, b });
    setHexColor(hex);
    
    // Notify parent
    onColorChange(hex, r, g, b);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Color</Text>
      
      <View style={styles.colorPreview}>
        <View 
          style={[
            styles.colorBox, 
            { backgroundColor: `rgb(${red}, ${green}, ${blue})` }
          ]} 
        />
        <TextInput
          style={styles.hexInput}
          value={hexColor}
          onChangeText={handleHexChange}
          maxLength={7}
          placeholder="#FFFFFF"
        />
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: 'red' }]}>R: {red}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={red}
          onValueChange={(value) => handleRGBChange(value, green, blue)}
          minimumTrackTintColor="red"
          maximumTrackTintColor="#ccc"
          thumbTintColor="red"
        />
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: 'green' }]}>G: {green}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={green}
          onValueChange={(value) => handleRGBChange(red, value, blue)}
          minimumTrackTintColor="green"
          maximumTrackTintColor="#ccc"
          thumbTintColor="green"
        />
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: 'blue' }]}>B: {blue}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={blue}
          onValueChange={(value) => handleRGBChange(red, green, value)}
          minimumTrackTintColor="blue"
          maximumTrackTintColor="#ccc"
          thumbTintColor="blue"
        />
      </View>
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
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 15,
  },
  hexInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    width: 100,
    backgroundColor: 'white',
    fontSize: 16,
  },
  sliderContainer: {
    marginBottom: 10,
  },
  sliderLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

// Add displayName property to fix the "Cannot read property 'displayName' of undefined" error
ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;