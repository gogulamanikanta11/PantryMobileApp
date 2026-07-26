import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import {
  CameraView,
  useCameraPermissions
} from 'expo-camera';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebase/config';
import { router } from 'expo-router';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [adding, setAdding] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const addScannedItem = async (barcode: string) => {
    let name = "Cereal Box";
    let imageUrl = "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200&auto=format&fit=crop";
    let stock = "5";
    let expiry = "10 days";

    const cleanBarcode = barcode.trim();
    if (cleanBarcode.includes('7')) {
      name = "Fresh Apples";
      imageUrl = "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&auto=format&fit=crop";
    } else if (cleanBarcode.includes('8')) {
      name = "Whole Milk";
      imageUrl = "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop";
    } else if (cleanBarcode.includes('9')) {
      name = "Organic Bread";
      imageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop";
    } else if (cleanBarcode.includes('0')) {
      name = "Fresh Eggs";
      imageUrl = "https://images.unsplash.com/photo-1518569656558-0f257c54d43f?w=200&auto=format&fit=crop";
    } else if (cleanBarcode.includes('5')) {
      name = "Red Tomatoes";
      imageUrl = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop";
    }

    setAdding(true);
    try {
      await addDoc(collection(db, 'pantry'), {
        name,
        stock,
        expiry,
        imageUrl,
        barcode: cleanBarcode,
        createdAt: new Date()
      });
      
      if (Platform.OS === 'web') {
        window.alert(`Successfully Added ${name} to Pantry!`);
      } else {
        Alert.alert('Success', `Added ${name} to Pantry!`);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error(err);
      if (Platform.OS === 'web') {
        window.alert(`Error: ${err.message}`);
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setAdding(false);
      setScanned(false);
    }
  };

  const handleScanEvent = (barcodeData: string) => {
    setScanned(true);
    let previewName = "Cereal Box";
    if (barcodeData.includes('7')) previewName = "Fresh Apples";
    else if (barcodeData.includes('8')) previewName = "Whole Milk";
    else if (barcodeData.includes('9')) previewName = "Organic Bread";
    else if (barcodeData.includes('0')) previewName = "Fresh Eggs";
    else if (barcodeData.includes('5')) previewName = "Red Tomatoes";

    const promptMessage = `Detected Product: ${previewName} (Barcode: ${barcodeData}). Add this item to your Pantry?`;

    if (Platform.OS === 'web') {
      const confirmAdd = window.confirm(promptMessage);
      if (confirmAdd) {
        addScannedItem(barcodeData);
      } else {
        setScanned(false);
      }
    } else {
      Alert.alert('Scan & Add', promptMessage, [
        { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
        { text: 'Add Item', style: 'default', onPress: () => addScannedItem(barcodeData) }
      ]);
    }
  };

  const handleManualSimulate = () => {
    if (manualBarcode.trim() === '') {
      if (Platform.OS === 'web') window.alert('Enter barcode digits first');
      else Alert.alert('Error', 'Enter barcode digits first');
      return;
    }
    handleScanEvent(manualBarcode);
  };

  if (!permission) {
    return <View style={styles.container} testID="scanner-loading" />;
  }

  // Camera permissions are required but camera component is not supported or not granted on web
  if (!permission.granted && Platform.OS !== 'web') {
    return (
      <View style={styles.container} testID="scanner-permission-view">
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity
          testID="grant-permission-button"
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1020' }} testID="scanner-screen">
      {/* Show camera view only on native platforms or if permission is granted */}
      {permission.granted && Platform.OS !== 'web' ? (
        <CameraView
          style={{ flex: 4 }}
          testID="camera-view"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128']
          }}
          onBarcodeScanned={scanned ? undefined : ({ data }) => handleScanEvent(data)}
        />
      ) : (
        <View style={styles.webFallback}>
          <Text style={styles.fallbackTitle}>📸 Web Barcode Simulator</Text>
          <Text style={styles.fallbackSubtitle}>Enter barcode digits below to simulate a package scan & add.</Text>
          
          <TextInput
            placeholder="Barcode (e.g. 1007, 1008, 1009, 1000)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={handleManualSimulate}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.simulateBtnText}>Simulate Scan & Add</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Manual option even when camera is active */}
      {permission.granted && Platform.OS !== 'web' && (
        <View style={styles.manualOverLay}>
          <TextInput
            placeholder="Enter Barcode Manually"
            placeholderTextColor="#94A3B8"
            style={styles.overlayInput}
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.overlayBtn} onPress={handleManualSimulate}>
            <Text style={styles.buttonText}>Add Barcode</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => router.back()} style={styles.cancelLink}>
        <Text style={styles.cancelText}>Back to Pantry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1020'
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 12
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#0B1020'
  },
  fallbackTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  simulateBtn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  simulateBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  manualOverLay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  overlayInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    color: 'white',
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  overlayBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  cancelLink: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600'
  }
});
