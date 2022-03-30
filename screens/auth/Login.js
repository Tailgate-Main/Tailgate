import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { db, auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"
// import firebase from 'firebase';
// import useGoogleAuthentication from './useGoogleAuthentication';
import * as Google from 'expo-auth-session/providers/google';
import firebase from "firebase"
import * as Web from "expo-web-browser"

Web.maybeCompleteAuthSession();

const Login = ({ navigation }) => {
    const [loading, setLoading] = useState(true)
    const [request, response, wef] = Google.useIdTokenAuthRequest(
        {
            iosClientId: "1055584929031-rc0dq5304qqlpeed6tpsrvppsnh7db7n.apps.googleusercontent.com",
            expoClientId: "1055584929031-817cu9jj6ofqcs1c7amuc7f7i2pr931f.apps.googleusercontent.com"
        }
    );

    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                const { id_token } = response.params;

                const provider = new firebase.auth.GoogleAuthProvider();
                const credential = provider.credential(id_token);
                firebase.auth().signInWithCredential(credential);
            }
        }
    }, [response]);

    // const [googleAuthLoading, authWithGoogle] = useGoogleAuthentication();

    // async function login(credential, data) {
    //     const user = await loginWithCredential(credential, data);
    //   }

    // async function loginWithGoogle() {
    //     try {
    //       const [credential] = await authWithGoogle();
    //       await login(credential);
    //     } catch (error) {
    //       console.error(error);
    //       Alert.alert('Error', 'Something went wrong. Please try again later.');
    //     }
    //   }

    useEffect(() => {

        async function func() {
            auth.onAuthStateChanged(async (user) => {
                if (user != null) {
                    await db.collection("users").doc(user.email).set(
                        {
                            userId: user.uid,
                            userName: user.displayName,
                            userEmail: user.email
                        })
                    setTimeout(() => {
                        navigation.navigate("home")
                    }, 200)

                } else {
                    setLoading(false)

                }

                // Do other things
            });
        }
        func()
    }, []);

    // const handleGoogleLogin = () => {
    //     const config = {
    //         iosClientId: "1055584929031-rc0dq5304qqlpeed6tpsrvppsnh7db7n.apps.googleusercontent.com",
    //         androidClientId: "1055584929031-knk8nandd57812sl00c2n550bnj2veqm.apps.googleusercontent.com",
    //         scopes: ['profile', 'email']
    //     }

    //     Google.signInAsync(config)
    //         .then((result) => {
    //             const { type, user } = result
    //             const { idToken, accessToken } = result;
    //             if (type === "success") {
    //                 const { email, name, photoUrl } = user
    //                 const credential = firebase.auth.GoogleAuthProvider
    //                     .credential(idToken, accessToken);
    //                 auth.signInWithCredential(credential)
    //                     .then(async (res) => {
    //                         // user res, create your user, do whatever you want
    //                         await db.collection("users").doc(res.user.email).set(
    //                             {
    //                                 userId: res.user.uid,
    //                                 userName: res.user.displayName,
    //                                 userEmail: res.user.email
    //                             })
    //                         setTimeout(() => {
    //                             navigation.navigate("home")
    //                         }, 200)
    //                     })
    //             } else {
    //                 alert("Sign in not successful")
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(error)
    //             alert("AN ERROR OCCURRED")
    //         })
    // }

    return (
        <SafeAreaView style={[tw`bg-white h-full`]}>
            <View style={tw`flex-1`}>
                <View style={[tw`m-auto flex items-center`]}>
                    <Text style={[tw`text-black text-3xl font-semibold mb-4`]}>Login to your account</Text>
                    {
                        loading ?
                            <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400  rounded-xl w-80 shadow-lg justify-center h-12 mb-2`]}>
                                <ActivityIndicator color="#000" animating={loading} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400 rounded-xl w-80 shadow-lg justify-between mb-2 px-14`]} onPress={() => {
                                // loginWithGoogle()
                                // alert("HELLOOO")
                                wef()
                            }}>
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
