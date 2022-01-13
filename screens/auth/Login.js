import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, KeyboardAvoidingView, TouchableOpacity, TextInput, Image } from 'react-native'
import { db, auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"
import * as Google from "expo-google-app-auth"
import firebase from 'firebase';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        return firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                navigation.navigate("home")
            }
            setLoading(false);
        });
    }, []);

    const handleLogin = async () => {
        await auth.signInWithEmailAndPassword(email, password)
        navigation.navigate("home")
    }

    const handleGoogleLogin = () => {
        const config = {
            iosClientId: "1055584929031-rc0dq5304qqlpeed6tpsrvppsnh7db7n.apps.googleusercontent.com",
            androidClientId: "1055584929031-knk8nandd57812sl00c2n550bnj2veqm.apps.googleusercontent.com",
            scopes: ['profile', 'email']
        }

        Google.logInAsync(config)
            .then((result) => {
                const { type, user } = result
                const { idToken, accessToken } = result;
                if (type === "success") {
                    const { email, name, photoUrl } = user
                    const credential = firebase.auth.GoogleAuthProvider
                        .credential(idToken, accessToken);
                    firebase.auth().signInWithCredential(credential)
                        .then(async (res) => {
                            // user res, create your user, do whatever you want
                            await db.collection("users").doc(res.user.email).set(
                                {
                                    userId: res.user.uid,
                                    userName: res.user.displayName,
                                    userEmail: res.user.email
                                })
                            alert(email)
                        })
                } else {
                    alert("Sign in not successful")
                }
            })
            .catch((error) => {
                console.log(error)
                alert("AN ERROR OCCURRED")
            })
    }

    return (
        <SafeAreaView style={[tw`bg-yellow-400 h-full`]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={tw`flex-1`}>
                <View style={[tw`m-auto flex items-center`]}>
                    <Text style={[tw`text-black text-3xl font-bold mb-6`]}>TAILGATE</Text>
                    <TouchableOpacity style={[tw`flex flex-row p-2.5 bg-white rounded-xl w-80 border-2 border-black justify-between px-14 mb-2`]} onPress={() => { handleGoogleLogin() }}>
                        <Image source={require('../../assets/login_Img/google.png')} />
                        <Text style={[tw`text-black text-lg text-center`]}>
                            Sign in with Google
                        </Text>
                    </TouchableOpacity>
                    <View style={[tw`flex flex-row`]}>
                        <Text style={[tw`mr-2 text-lg`]}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => { navigation.navigate("signup") }}>
                            <Text style={[tw`mr-2 text-lg text-blue-600`]}>Signup here!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>

    )
}


export default Login
