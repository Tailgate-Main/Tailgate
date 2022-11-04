import React, { useEffect, useRef, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { db, auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"
// import firebase from 'firebase';
// import useGoogleAuthentication from './useGoogleAuthentication';
import * as Google from 'expo-auth-session/providers/google';
import firebase from "firebase"
import * as Web from "expo-web-browser"
import useAppleAuthentication from "../../hooks/useAppleAuth"
import * as AppleAuthentication from 'expo-apple-authentication';
import googleIcon from "../../assets/login_Img/google.png"

Web.maybeCompleteAuthSession();

const Login = ({ navigation }) => {

    const [appleAuthAvailable, authWithApple] = useAppleAuthentication();
    const nameFromApple2 = useRef(null)
    const appleCred = useRef(null)

    async function loginWithApple() {
        try {
            const [credential, data] = await authWithApple();
            console.log(data)
            if(data.displayName != "null null"){
                console.log("Name was not null null")
                nameFromApple2.current = data.displayName
            }
            appleCred.current = credential
            console.log(appleCred.current)
            auth.signInWithCredential(credential);
        } catch (error) {
            throw error;
        }
    }

    const [loading, setLoading] = useState(true)
    const [request, response, googleAuth] = Google.useIdTokenAuthRequest(
        {
            iosClientId: "1055584929031-rc0dq5304qqlpeed6tpsrvppsnh7db7n.apps.googleusercontent.com",
            expoClientId: "1055584929031-817cu9jj6ofqcs1c7amuc7f7i2pr931f.apps.googleusercontent.com"
        }
    );

    useEffect(() => {
        async function func(){
            if (response) {
                console.log(response)
                if (response.type === 'success') {
                    console.log("WEFOUHWEFIUH")
                    const { id_token } = response.params;
                    const provider = new firebase.auth.GoogleAuthProvider();
                    const credential = provider.credential(id_token);
                    console.log(credential)
                    await auth.signInWithCredential(credential);
                }
            }
        }
        func()
    }, [response]);

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
                            }, 1000)
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
                        <Text style={[tw`text-yellow-400 text-4xl font-bold mb-4`]}>We</Text>
                        <Text style={[tw`text-black text-4xl mb-4`]}>Go</Text>
                    </View>
                    {
                        loading ?
                            <View>
                                <TouchableOpacity style={[tw`flex-row p-2.5 bg-black  rounded-xl w-80 shadow-lg justify-center h-12 mb-2`]}>
                                    <ActivityIndicator color="#fff" animating={loading} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400  rounded-xl w-80 shadow-lg justify-center h-12 mb-2`]}>
                                    <ActivityIndicator color="#000" animating={loading} />
                                </TouchableOpacity>
                            </View>

                            :
                            <View>
                                {appleAuthAvailable &&
                                    // <TouchableOpacity style={[tw`flex-row p-2.5 bg-black rounded-xl w-80 shadow-lg justify-between mb-2 justify-center items-center`]} onPress={loginWithApple}>
                                    //     <Image style={[tw`w-6 h-6`]} source={appleIcon} />
                                    //     <Text style={[tw`text-white text-lg text-center`]}>
                                    //         Sign in with Apple
                                    //     </Text>
                                    // </TouchableOpacity>
                                    <AppleAuthentication.AppleAuthenticationButton
                                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                        cornerRadius={5}
                                        style={{ width: 320, height: 53 }}
                                        onPress={loginWithApple}
                                    />
                                }
                                <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400 rounded w-80 shadow-lg justify-between mb-2 mt-2 justify-center items-center`]} onPress={() => {
                                    googleAuth()
                                }}>
                                    <Image style={[tw`w-5 h-5 mr-1`]} source={googleIcon} />
                                    <Text style={[tw`text-black text-lg text-center font-semibold`]}>
                                        Sign in with Google
                                    </Text>
                                </TouchableOpacity>
                            </View>

                    }
                </View>
            </View>

        </SafeAreaView>

    )
}

export default Login