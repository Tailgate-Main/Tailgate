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
    provider.addScope('fullName');

    // const credential = provider.credential({
    //   idToken: identityToken,
    //   rawNonce,
    // });


    // const displayName = fullName ? `${fullName.givenName} ${fullName.familyName}` : undefined;
    // const data = { email, displayName };

    // console.log(data)

    // return [credential, data];

  firebase
  .auth()
  .signInWithPopup(provider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // The signed-in user info.
    var user = result.user;

    // You can also get the Apple OAuth Access and ID Tokens.
    var accessToken = credential.accessToken;
    var idToken = credential.idToken;

    // ...
    console.log(user)
  })
  .catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;

    // ...
  });
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