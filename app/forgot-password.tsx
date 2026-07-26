import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../backend/firebase/config';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      if (Platform.OS === 'web') {
        window.alert('Password reset email sent! Please check your inbox.');
        router.back();
      } else {
        Alert.alert(
          'Success',
          'Password reset email sent! Please check your inbox.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.log('RESET ERROR:', error);
      Alert.alert('Error', error?.message || 'Failed to send reset email');
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
          <View style={styles.glassCard}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Ionicons name="key-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                />
              </View>

              {/* Reset Button */}
              <TouchableOpacity style={styles.primaryButton} onPress={handleReset} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
              </TouchableOpacity>
            </View>

            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>Back to Login</Text>
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
  subtitle: { textAlign: 'center', marginTop: 10, color: COLORS.subtext, fontSize: 14, lineHeight: 20 },
  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
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
  backButton: { marginTop: 25, alignItems: 'center' },
  backText: { color: COLORS.subtext, fontSize: 14, fontWeight: '500' }
});
