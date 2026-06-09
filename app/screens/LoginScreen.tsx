import React from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

import { auth } from '../../firebase/config';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {

    if (!email || !password) {

      Alert.alert(
        'Error',
        'Enter email and password'
      );

      return;

    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await AsyncStorage.setItem(
        'user',
        email
      );

      router.replace(
        '/dashboard'
      );

    }

    catch (error: any) {

      console.log(error);

      Alert.alert(
        'Login Error',
        error.message
      );

    }

  };

  const forgotPassword = async () => {

    if (!email) {

      Alert.alert(
        'Error',
        'Enter your email'
      );

      return;

    }

    try {

      await sendPasswordResetEmail(
        auth,
        email
      );

      Alert.alert(
        'Success',
        'Password reset email sent'
      );

    }

    catch (error: any) {

      Alert.alert(
        'Error',
        error.message
      );

    }

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Smart Pantry AI
      </Text>

      <Text style={styles.subtitle}>
        Login to continue
      </Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={login}
      >

        <Text style={styles.buttonText}>
          Login
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/register')}
      >

        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'green'
          }}
        >
          Create New Account
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        onPress={forgotPassword}
      >

        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'red'
          }}
        >
          Forgot Password?
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
  },

  input: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

});