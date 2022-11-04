import React, { useEffect, useRef, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { db, auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"
// import firebase from 'firebase';
// import useGoogleAuthentication from './useGoogleAuthentication';
import * as Google from 'expo-auth-session/providers/google';
import firebase from "firebase"
import { TextInput } from 'react-native-gesture-handler';

const Login = ({ navigation }) => {

    useEffect(() => {

        async function func() {
            auth.onAuthStateChanged(async (user) => {
                console.log("WFIUGYWEFIUWEOHU")
                if (user != null) {
                    console.log("NAME", nameFromApple2.current)
                    if (nameFromApple2.current) {
                        await auth.currentUser.updateProfile({
                            displayName: nameFromApple2.current
                        });
                        appleCredParsed = JSON.parse(JSON.stringify(appleCred.current))
                        console.log("CREDE", appleCredParsed)
                        await db.collection("users").doc(user.email).set(
                            {
                                userId: user.uid,
                                userName: nameFromApple2.current,
                                userEmail: user.email,
                                nonce: appleCredParsed.nonce,
                                oauthIdToken: appleCredParsed.oauthIdToken,
                                providerId: appleCredParsed.providerId, 
                                signInMethod: appleCredParsed.signInMethod
                            }, {merge: true})
                        setTimeout(() => {
                            navigation.navigate("home")
                        }, 200)
                    } else {
                        await db.collection("users").doc(user.email).set(
                            {
                                userId: user.uid,
                                userName: user.displayName,
                                userEmail: user.email
                            }, {merge: true})
                            setTimeout(() => {
                                navigation.navigate("home")
                            }, 200)
                    }
                } else {
                    setLoading(false)

                }

                // Do other things
            });
        }
        func()
    }, []);

    return (
        <SafeAreaView style={[tw`bg-white h-full`]}>
            <View style={tw`flex-1`}>
                <View style={[tw`m-auto flex items-center`]}>
                    <View style={[tw`flex-row items-center`]}>
                        <Text style={[tw`text-4xl font-bold mb-4`]}>Login</Text>
                    </View>
                    <View>
                        <TextInput />
                    </View>
                </View>
            </View>

        </SafeAreaView>

    )
}

export default Login