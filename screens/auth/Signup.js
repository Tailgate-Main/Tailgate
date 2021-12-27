import React, { useState } from 'react'
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Image } from 'react-native'
import tw from 'tailwind-react-native-classnames';
import { auth, db } from '../../config/firebaseConfig';
import * as Google from "expo-google-app-auth"
import firebase from 'firebase';

const Signup = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const handleSignup = async () => {
        const response = await auth.createUserWithEmailAndPassword(email, password)

        const user = {
            uid: response.user.uid,
            email: email,
        }
        await db.collection("users").doc(response.user.uid).set(user)
        await auth.signInWithEmailAndPassword(email, password)
        navigation.navigate("home")
    }

    const handleGoogleSignup = async () => {
        const config = {
            iosClientId: "1055584929031-rc0dq5304qqlpeed6tpsrvppsnh7db7n.apps.googleusercontent.com",
            androidClientId: "1055584929031-knk8nandd57812sl00c2n550bnj2veqm.apps.googleusercontent.com",
            scopes: ['profile', 'email']
        }

        Google.logInAsync(config)
            .then(async (result) => {
                const { type, user } = result
                if (type === "success") {
                    const { idToken, accessToken } = result;
                    const credential = firebase.auth.GoogleAuthProvider
                    .credential(idToken, accessToken);
                    firebase.auth().signInWithCredential(credential)
                        .then(async (res) => {
                            // user res, create your user, do whatever you want
                            await db.collection("users").doc(res.user.uid).set(
                            {
                                userId: res.user.uid,
                                userName: res.user.displayName,
                                userEmail: res.user.email
                            })
                            navigation.navigate("home")
                        })
                        .catch(error => {
                            console.log("firebase cred err:", error);
                        });
                } else {
                    return { cancelled: true };
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
                    <Text style={[tw`text-black text-3xl font-semibold mb-10`]}>Create your account</Text>
                    <TextInput
                        style={[tw`border-2 bg-white border-black rounded-xl w-80 h-12 mb-4 pl-2 pr-2`]}
                        onChangeText={(e) => { setEmail(e) }}
                        placeholder="Email"
                        value={email}
                    />
                    <TextInput
                        style={[tw`border-2 border-black bg-white rounded-xl w-80 h-12 pl-2 pr-2 mb-4`]}
                        onChangeText={(e) => { setPassword(e) }}
                        placeholder="Password"
                        value={password}
                        secureTextEntry={true}

                    />
                    <TouchableOpacity style={[tw`flex items-center p-2.5 bg-black rounded-xl w-80 mb-2`]} onPress={() => { handleSignup() }}>
                        <Text style={[tw`text-white text-lg`]}>
                            Signup
                        </Text>
                    </TouchableOpacity>
                    <View style={[tw`flex flex-row`]}>
                        <Text style={[tw`mr-2 text-lg`]}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => { navigation.navigate("login") }}>
                            <Text style={[tw`mr-2 text-lg text-blue-600`]}>Login here!</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[tw`flex flex-row p-2.5 bg-white rounded-xl w-80 mt-2 border-2 border-black justify-between px-14`]} onPress={() => { handleGoogleSignup() }}>
                        <Image source={require('../../assets/login_Img/google.png')} />
                        <Text style={[tw`text-black text-lg`]}>
                            Sign in with Google
                        </Text>                        
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>

    )
}

export default Signup
