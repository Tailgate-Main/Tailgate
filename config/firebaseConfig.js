import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAyFfXUcycavtmhxURQhAAd203uH4Pq0KE",
    authDomain: "tailga.firebaseapp.com",
    projectId: "tailga",
    storageBucket: "tailga.appspot.com",
    messagingSenderId: "282198568023",
    appId: "1:282198568023:web:168c0fd9b59fc885e78712",
    measurementId: "G-1X45H0Y44K"
})

const db = firebase.firestore()

db.settings({
    timestampsInSnapshots: true,
    merge: true,
    experimentalForceLongPolling: true
})

const auth = firebaseApp.auth()

export { db, auth }