import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAyFfXUcycavtmhxURQhAAd203uH4Pq0KE",
    authDomain: "tailga.firebaseapp.com",
    projectId: "tailga",
    storageBucket: "tailga.appspot.com",
    messagingSenderId: "282198568023",
    appId: "1:282198568023:web:168c0fd9b59fc885e78712",
    measurementId: "G-1X45H0Y44K"
})

// firebase.firestore().settings({
// })

const loginWithApple = async () => {
    if (identityToken) {
        const provider = new firebaseApp.auth.OAuthProvider("apple.com");
        const credential = provider.credential({
            idToken: identityToken,
            rawNonce: nonce // nonce value from above
        });
        await firebaseApp.auth().signInWithCredential(credential);
    }
}

const db = firebase.firestore()

db.settings({
    timestampsInSnapshots: true,
    merge: true,
    experimentalForceLongPolling: true
})



const auth = firebaseApp.auth()

export { db, auth }