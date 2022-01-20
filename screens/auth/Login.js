import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, KeyboardAvoidingView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native'
import { db, auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"
import * as Google from "expo-google-app-auth"
import firebase from 'firebase/compat';

const Login = ({ navigation }) => {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        auth.onAuthStateChanged(function(user) {
            console.log("AEFIUHAEF")
            console.log(user)
            if (user) {
                navigation.navigate("home")
            } else {
              // no user logged in. currentUser is null.
            }
            setLoading(false)
          });
    }, []);

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
                    auth.signInWithCredential(credential)
                        .then(async (res) => {
                            // user res, create your user, do whatever you want
                            await db.collection("users").doc(res.user.email).set(
                                {
                                    userId: res.user.uid,
                                    userName: res.user.displayName,
                                    userEmail: res.user.email
                                })
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
        <SafeAreaView style={[tw`bg-white h-full`]}>
            <View style={tw`flex-1`}>
                <View style={[tw`m-auto flex items-center`]}>
                    <Text style={[tw`text-black text-3xl font-semibold mb-4`]}>Login to your account</Text>
                    {
                        loading ?
                            <TouchableOpacity style={[tw`flex-row p-2.5 bg-white rounded-xl w-80 border-2 border-black justify-center h-14 mb-2`]} onPress={() => { handleGoogleLogin() }}>
                                <ActivityIndicator color="#000" animating={loading} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400 rounded-xl w-80 shadow-lg justify-between mb-2 px-14`]} onPress={() => { handleGoogleLogin() }}>
                                <Image source={require('../../assets/login_Img/google.png')} />
                                <Text style={[tw`text-black text-lg text-center`]}>
                                    Sign in with Google
                                </Text>
                            </TouchableOpacity>
                    }

                    <View style={[tw`flex flex-row`]}>
                        <Text style={[tw`mr-2 text-lg`]}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => {
                            if (!loading) {
                                navigation.navigate("signup")
                            }
                        }}>
                            <Text style={[tw`mr-2 text-lg text-blue-600 text-yellow-400`]}>Signup here!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </SafeAreaView>

    )
}


export default Login
