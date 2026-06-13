import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../backend/firebase/config';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setError('');

    // 1. Basic Local Validation
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    console.log("--- Starting Registration ---");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log("Success! User ID:", userCredential.user.uid);

      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message);

      let msg = 'An unexpected error occurred.';

      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address format.';
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
      else if (err.code === 'auth/network-request-failed') msg = 'Network error. Check your internet.';
      else if (err.code === 'auth/operation-not-allowed') msg = 'Email login is disabled in Firebase Console.';
      else msg = err.message;

      setError(msg);
      // Backup alert in case the UI text is hidden by keyboard
      Alert.alert('Registration Error', msg);
    } finally {
      setLoading(false);
      console.log("--- Registration Attempt Finished ---");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView contentContainerStyle={styles.container} testID="register-screen">
        <Text style={styles.title} testID="register-title">Create Account</Text>
        <Text style={styles.subtitle}>Join Smart Pantry AI</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text testID="error-message" style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <TextInput
          testID="register-email-input"
          placeholder="Email Address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          testID="register-password-input"
          placeholder="Password (min 6 chars)"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          testID="register-submit-button"
          style={[styles.button, loading && { backgroundColor: '#A5D6A7' }]}
          onPress={register}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Register Now</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backLink} disabled={loading}>
          <Text style={styles.backLinkText}>Already have an account? <Text style={styles.greenText}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: 'green' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  errorBox: { backgroundColor: '#FFEBEB', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#FFCACA' },
  errorText: { color: '#D32F2F', textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 16, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: 'green', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  backLink: { marginTop: 25 },
  backLinkText: { textAlign: 'center', color: '#666', fontSize: 15 },
  greenText: { color: 'green', fontWeight: 'bold' }
});
