import { isAvailableAsync, AppleAuthenticationScope, signInAsync } from 'expo-apple-authentication';
import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';
import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import firebase from "firebase"

async function login() {
  console.log('Signing in with Apple...');
  const state = Math.random().toString(36).substring(2, 15);
  const rawNonce = Math.random().toString(36).substring(2, 10);
  const requestedScopes = [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL];

  try {
    const nonce = await digestStringAsync(CryptoDigestAlgorithm.SHA256, rawNonce);

    const appleCredential = await signInAsync({
      requestedScopes,
      state,
      nonce,
    });

    const { identityToken, email, fullName } = appleCredential;

    console.log(appleCredential)

    if (!identityToken) {
      throw new Error('No identity token provided.');
    }

    var provider = new firebase.auth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    const credential = provider.credential({
      idToken: identityToken,
      rawNonce,
    });

    const displayName = fullName ? `${fullName.givenName} ${fullName.familyName}` : undefined;
    const data = { email, displayName };

    console.log(data)

    return [credential, data];

  } catch (error) {
    throw error;
  }
}

export default function useAppleAuthentication() {
  const [authenticationLoaded, setAuthenticationLoaded] = useState(false);

  useEffect(() => {
    async function checkAvailability() {
      try {
        const available = await isAvailableAsync();

        setAuthenticationLoaded(available);
      } catch (error) {
        Alert.alert('Error', error?.message);
      }
    }

    if (Platform.OS === 'ios' && !authenticationLoaded) {
        console.log("CHECKING")
      checkAvailability();
    }
  }, []);

  return [authenticationLoaded, login];
}