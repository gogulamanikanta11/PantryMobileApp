import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import {
  CameraView,
  useCameraPermissions
} from 'expo-camera';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} testID="scanner-loading" />;
  }

  if (!permission.granted) {
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
    <View style={{ flex: 1 }} testID="scanner-screen">
      <CameraView
        style={{ flex: 1 }}
        testID="camera-view"
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128'
          ]
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                Alert.alert('Scanned!', `Barcode: ${data}`, [
                  { text: 'OK', onPress: () => setScanned(false) }
                ]);
              }
        }
      />

      {scanned && (
        <TouchableOpacity
          testID="scan-again-button"
          style={styles.scanAgain}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
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
    fontWeight: 'bold'
  },
  scanAgain: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 12
  }
});
