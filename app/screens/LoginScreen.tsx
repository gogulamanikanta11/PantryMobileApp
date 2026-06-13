import React, { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../../backend/firebase/config';

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone/OTP States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const recaptchaVerifier = useRef<any>(null);

  // Initialize Recaptcha for Web
  useEffect(() => {
    if (Platform.OS === 'web' && !recaptchaVerifier.current) {
      try {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha resolved');
          }
        });
      } catch (err) {
        console.error('Recaptcha init error:', err);
      }
    }
  }, []);

  const handleEmailLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await AsyncStorage.setItem('user', email);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError('');
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Enter phone number with country code (e.g. +1...)');
      return;
    }

    setLoading(true);
    try {
      // For Android native, Firebase often handles Recaptcha via safety net/play services.
      // For Web, we use the verifier we initialized.
      const appVerifier = recaptchaVerifier.current;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      Alert.alert('Success', 'OTP sent to ' + phoneNumber);
    } catch (err: any) {
      console.error(err);
      setError('Error: ' + (err.message || 'Check if Phone Auth is enabled in Firebase Console.'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        await AsyncStorage.setItem('user', phoneNumber);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View testID="login-screen">
          <Text style={styles.title}>Smart Pantry AI</Text>
          <Text style={styles.subtitle}>Smart management for your kitchen</Text>

          {/* Toggle between Email and Phone */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, loginMethod === 'email' && styles.toggleActive]}
              onPress={() => { setLoginMethod('email'); setError(''); }}
            >
              <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, loginMethod === 'phone' && styles.toggleActive]}
              onPress={() => { setLoginMethod('phone'); setError(''); }}
            >
              <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>OTP Login</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text testID="error-message" style={styles.errorText}>{error}</Text>
          ) : null}

          {loginMethod === 'email' ? (
            /* Email Login */
            <View>
              <TextInput
                testID="email-input"
                placeholder="Email Address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <TextInput
                testID="password-input"
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                testID="login-button"
                style={styles.primaryButton}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            /* Phone OTP Login */
            <View>
              {!confirmationResult ? (
                <View>
                  <TextInput
                    placeholder="Phone Number (e.g. +91 9876543210)"
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={sendOtp}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Get OTP</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.infoText}>OTP sent to {phoneNumber}</Text>
                  <TextInput
                    placeholder="Enter 6-digit Code"
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={verifyOtp}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmationResult(null)} style={styles.backAction}>
                    <Text style={styles.backLinkText}>Edit Phone Number</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Recaptcha container for Web */}
          {Platform.OS === 'web' && <div id="recaptcha-container"></div>}

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={{ marginTop: 15 }}>
              <Text style={[styles.footerLink, { color: '#EF4444' }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#10B981', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 30, color: '#64748B' },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 5,
    marginBottom: 25
  },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: '#fff', elevation: 3 },
  toggleText: { color: '#94A3B8', fontWeight: 'bold' },
  toggleTextActive: { color: '#10B981' },
  errorText: { color: '#EF4444', textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  infoText: { textAlign: 'center', marginBottom: 15, color: '#64748B', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F8FAFC'
  },
  primaryButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  footer: { marginTop: 35, alignItems: 'center' },
  footerLink: { color: '#10B981', fontWeight: '600', fontSize: 15 },
  backAction: { marginTop: 15, alignItems: 'center' },
  backLinkText: { color: '#94A3B8', textDecorationLine: 'underline' }
});
