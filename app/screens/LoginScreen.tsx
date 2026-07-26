import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    signInWithEmailAndPassword
} from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../../backend/firebase/config';
import { COLORS } from '../../constants/theme';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

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

  return (
    <LinearGradient
      colors={[COLORS.background1, COLORS.background2, COLORS.background3]}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View testID="login-screen" style={styles.glassCard}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Ionicons name="restaurant" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Smart Pantry AI</Text>
              <Text style={styles.subtitle}>Smart management for your kitchen</Text>
            </View>

            {/* Sign In Options */}
            <View style={styles.toggleContainer}>
              <View style={[styles.toggleButton, styles.toggleActive]}>
                <Text style={[styles.toggleText, styles.toggleTextActive]}>Sign In</Text>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
                <Text testID="error-message" style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {/* Email Input */}
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  testID="email-input"
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password Input */}
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  testID="password-input"
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
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

              {/* Login Button */}
              <TouchableOpacity
                testID="login-button"
                style={styles.primaryButton}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
              </TouchableOpacity>
            </View>

            {/* Footer Navigation */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.footerLink}>Don&apos;t have an account? <Text style={styles.footerLinkHighlight}>Sign Up</Text></Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/forgot-password')} style={{ marginTop: 15 }}>
                <Text style={[styles.footerLink, { color: COLORS.danger }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { color: 'rgba(255, 255, 255, 0.5)', fontWeight: 'bold', fontSize: 15 },
  toggleTextActive: { color: COLORS.text },
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
  infoText: { textAlign: 'center', marginBottom: 15, color: COLORS.subtext, fontWeight: '500' },
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
  footer: { marginTop: 30, alignItems: 'center' },
  footerLink: { color: COLORS.subtext, fontSize: 14, fontWeight: '500' },
  footerLinkHighlight: { color: COLORS.primary, fontWeight: 'bold' },
  backAction: { marginTop: 15, alignItems: 'center' },
  backLinkText: { color: COLORS.subtext, textDecorationLine: 'underline', fontSize: 14 }
});
