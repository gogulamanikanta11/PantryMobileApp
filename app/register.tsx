import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../backend/firebase/config';
import { COLORS } from '../constants/theme';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | null>(null);

  const register = async () => {
    setError('');

    // 1. Basic Local Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    console.log("--- Starting Registration ---");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      });
      console.log("Success! User ID:", userCredential.user.uid);

      if (Platform.OS === 'web') {
        window.alert('Account created successfully!');
        router.replace('/login');
      } else {
        Alert.alert(
          'Success',
          'Account created successfully!',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
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
    <LinearGradient
      colors={[COLORS.background1, COLORS.background2, COLORS.background3]}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} testID="register-screen" showsVerticalScrollIndicator={false}>
          <View style={styles.glassCard}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Ionicons name="person-add" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.title} testID="register-title">Create Account</Text>
              <Text style={styles.subtitle}>Join Smart Pantry AI</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
                <Text testID="error-message" style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Registration Form */}
            <View style={styles.form}>
              {/* First Name Input */}
              <View style={[styles.inputWrapper, focusedField === 'firstName' && styles.inputWrapperFocused]}>
                <Ionicons name="person-outline" size={20} color={focusedField === 'firstName' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!loading}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Last Name Input */}
              <View style={[styles.inputWrapper, focusedField === 'lastName' && styles.inputWrapperFocused]}>
                <Ionicons name="person-outline" size={20} color={focusedField === 'lastName' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!loading}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Email Input */}
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  testID="register-email-input"
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password Input */}
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  testID="register-password-input"
                  placeholder="Password (min 6 chars)"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="rgba(255, 255, 255, 0.4)"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={[styles.inputWrapper, focusedField === 'confirmPassword' && styles.inputWrapperFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'confirmPassword' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                testID="register-button"
                style={[styles.primaryButton, loading && { backgroundColor: 'rgba(34, 197, 94, 0.5)' }]}
                onPress={register}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Register Now</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login Link */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backLink} disabled={loading}>
              <Text style={styles.backLinkText}>
                Already have an account? <Text style={styles.greenText}>Login</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  glassCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(20px)'
  },
  header: { alignItems: 'center', marginBottom: 25 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 5, color: COLORS.subtext, fontSize: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  errorText: { color: COLORS.danger, marginLeft: 10, fontWeight: '600', flex: 1, fontSize: 14 },
  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 15,
    height: 56
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    height: '100%'
  },
  eyeIcon: { padding: 4 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  buttonText: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  backLink: { marginTop: 25, alignItems: 'center' },
  backLinkText: { color: COLORS.subtext, fontSize: 14, fontWeight: '500' },
  greenText: { color: COLORS.primary, fontWeight: 'bold' }
});
