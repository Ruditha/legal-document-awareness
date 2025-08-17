// File: frontend/App.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Audio and Picker imports removed as per HOD's instruction
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';

// --- Main App Component ---
export default function App() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]); // This will be a list of strings
  const [imageUri, setImageUri] = useState(null); // To display selected image

  // Adjust backendUrl based on your setup:
  // - For Android emulator: 'http://10.0.2.2:8000' (connects to host's localhost)
  // - For iOS simulator/device: 'http://localhost:8000' (if running on same machine)
  // - For physical Android device on same Wi-Fi: 'http://YOUR_LOCAL_IP_ADDRESS:8000'
  const backendUrl = 'http://localhost:8000';
  // Request camera and media library permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera and media library permissions are needed to upload documents.');
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Clear previous results when a new image is selected
      setSummary('');
      setKeyPoints([]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Clear previous results when a new image is selected
      setSummary('');
      setKeyPoints([]);
    }
  };

  // Process the document (send to backend)
  const processDocument = async () => {
    if (!imageUri) {
      Alert.alert('No Document', 'Please select or take a photo of a document first.');
      return;
    }

    setLoading(true);
    setSummary('');
    setKeyPoints([]);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: `document.${imageUri.split('.').pop()}`,
      type: `image/${imageUri.split('.').pop()}`,
    });
    // target_language parameter removed as multi-lingual output is out of scope for now
    // formData.append('target_language', selectedLanguage); 

    try {
      const response = await fetch(`${backendUrl}/process_document`, {
        method: 'POST',
        body: formData,
        headers: {
          // 'Authorization': 'Basic ' + btoa('user:password'), // Uncomment for basic auth if enabled in main.py
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process document.');
      }

      const data = await response.json();
      setSummary(data.summary);
      setKeyPoints(data.key_points); // This expects a list of strings

    } catch (error) {
      console.error('Error processing document:', error);
      Alert.alert('Processing Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Audio playback function removed as per HOD's instruction
  // const playAudio = async () => { ... }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Consent Before Signing</Text>
      <Text style={styles.subtitle}>Legal Awareness App</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.label}>Selected Document:</Text>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>
      )}

      {/* Language picker removed as per HOD's instruction */}
      {/* <Text style={styles.label}>Select Output Language:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Tamil (தமிழ்)" value="ta" />
          <Picker.Item label="Kannada (ಕನ್ನಡ)" value="kn" />
          <Picker.Item label="Hindi (हिन्दी)" value="hi" />
          <Picker.Item label="Telugu (తెలుగు)" value="te" />
          <Picker.Item label="Malayalam (മലയാളം)" value="ml" />
        </Picker>
      </View> */}

      <TouchableOpacity
        style={[styles.processButton, (loading || !imageUri) && styles.processButtonDisabled]}
        onPress={processDocument}
        disabled={loading || !imageUri}
      >
        <Text style={styles.processButtonText}>{loading ? "Processing..." : "Process Document"}</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      )}

      {!loading && (summary || keyPoints.length > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Summary (English)</Text>
          <Text style={styles.resultText}>{summary || 'No summary available.'}</Text>

          <Text style={styles.sectionTitle}>Crucial Points (English)</Text>
          {keyPoints.length > 0 ? (
            keyPoints.map((point, index) => (
              <Text key={index} style={styles.resultText}>• {point}</Text>
            ))
          ) : (
            <Text style={styles.resultText}>No crucial points identified.</Text>
          )}
          
          {/* Translated output and audio button removed */}
          {/* {selectedLanguage !== 'en' && (
            <>
              <Text style={styles.sectionTitle}>Translated Output ({selectedLanguage})</Text>
              <Text style={styles.resultText}>{translatedOutput || 'Translation not available.'}</Text>
            </>
          )}
          
          {audioUrl && (
            <TouchableOpacity style={styles.playAudioButton} onPress={playAudio}>
              <Text style={styles.playAudioButtonText}>Play Audio Summary</Text>
            </TouchableOpacity>
          )} */}
        </View>
      )}
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F7F4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: { // This style is now unused but kept for reference
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: { // This style is now unused but kept for reference
    height: 50,
    width: '100%',
  },
  processButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  processButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: '#555',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 10,
  },
  playAudioButton: { // This style is now unused but kept for reference
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playAudioButtonText: { // This style is now unused but kept for reference
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
