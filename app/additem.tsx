import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebase/config';
import { router } from 'expo-router';

export default function AddItem() {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);

  const saveItem = async () => {
    if (item === '') {
      Alert.alert('Error', 'Enter item name');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'pantry'), {
        name: item,
        stock: quantity,
        expiry: expiry,
        createdAt: new Date()
      });
      Alert.alert('Success', 'Item Added Successfully');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Firebase Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const speakItem = () => {
    if (item === '') {
      Speech.speak('Please enter item name');
    } else {
      Speech.speak('Item is ' + item);
    }
  };

  return (
    <LinearGradient colors={['#0B1020', '#151B2F', '#1E293B']} style={{ flex: 1 }}>
      <View style={styles.container} testID="add-screen">
        <Text style={styles.title}>📦 Add Pantry Item</Text>

        <TextInput
          testID="item-name-input"
          placeholder="Item Name"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={item}
          onChangeText={setItem}
        />

        <TextInput
          testID="item-quantity-input"
          placeholder="Quantity"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <TextInput
          testID="item-expiry-input"
          placeholder="Expiry Date (e.g., 5 days)"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={expiry}
          onChangeText={setExpiry}
        />

        <TouchableOpacity
          testID="save-item-button"
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={saveItem}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Save Item</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          testID="speak-item-button"
          style={styles.voiceButton}
          onPress={speakItem}
        >
          <Text style={styles.buttonText}>🎤 Speak Item</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: '#94A3B8' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: 'white' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    marginBottom: 15,
    borderRadius: 16,
    color: 'white',
    fontSize: 16
  },
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 16, marginTop: 12 },
  voiceButton: { backgroundColor: '#06B6D4', padding: 16, borderRadius: 16, marginTop: 12 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});
