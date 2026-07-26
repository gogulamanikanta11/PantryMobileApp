import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
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
import { auth, db } from '../backend/firebase/config';

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [focusedField, setFocusedField] = useState<'firstName' | 'lastName' | 'phone' | 'email' | null>(null);
  const email = auth.currentUser?.email || '';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const getNameFromDisplayName = (displayName: string) => {
    const parts = displayName.trim().split(' ');
    return {
      first: parts[0] || '',
      last: parts.slice(1).join(' ') || '',
    };
  };

  const fetchProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
      } else if (auth.currentUser.displayName) {
        const nameParts = getNameFromDisplayName(auth.currentUser.displayName);
        setFirstName(nameParts.first);
        setLastName(nameParts.last);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        firstName,
        lastName,
        phone,
        email: auth.currentUser.email
      }, { merge: true });

      if (auth.currentUser.displayName !== `${firstName} ${lastName}`.trim()) {
        await updateProfile(auth.currentUser, {
          displayName: `${firstName} ${lastName}`.trim(),
        });
      }

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['#0B1020', '#151B2F', '#1E293B']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} testID="profile-screen">
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.userName}>{`${firstName} ${lastName}`.trim() || 'User'}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.rowGroup}>
              <View style={[styles.inputColumn, focusedField === 'firstName' && styles.inputWrapperFocused]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  testID="profile-first-name-input"
                  placeholder="First Name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              <View style={[styles.inputColumn, focusedField === 'lastName' && styles.inputWrapperFocused]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  testID="profile-last-name-input"
                  placeholder="Last Name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              testID="profile-email-input"
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />

            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              testID="profile-phone-input"
              placeholder="Enter mobile number"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              testID="save-profile-button"
              style={styles.saveButton}
              onPress={saveProfile}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="logout-button"
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="nav-home"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 5,
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.12)',
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputColumn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  inputWrapperFocused: {
    borderColor: '#4F46E5',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 0,
    minHeight: 40,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 16,
    borderRadius: 16,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});
