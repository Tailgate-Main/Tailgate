import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { db, auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"
// import firebase from 'firebase';
// import useGoogleAuthentication from './useGoogleAuthentication';
import * as Google from 'expo-auth-session/providers/google';
import firebase from "firebase"
import * as Web from "expo-web-browser"
import useAppleAuthentication from "../../hooks/useAppleAuth"

Web.maybeCompleteAuthSession();

const Signup = ({ navigation }) => {

    const [appleAuthAvailable, authWithApple] = useAppleAuthentication();

    async function loginWithApple() {
        try {
            const [credential, data] = await authWithApple();
            console.log(data)
            console.log(credential)
            firebase.auth().signInWithCredential(credential);
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
        if (response) {
            if (response.type === 'success') {
                const { id_token } = response.params;

                const provider = new firebase.auth.GoogleAuthProvider();
                const credential = provider.credential(id_token);
                firebase.auth().signInWithCredential(credential);
            }
        }
    }, [response]);

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
                    if(user.displayName == null){
                        console.log("here")
                        setTimeout(() => {
                            navigation.navigate("setname")
                        }, 200)
                    }else{
                        console.log("GOING HOME")
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
                    <Text style={[tw`text-black text-3xl font-semibold mb-4`]}>Sign up for an account</Text>
                    {
                        loading ?
                            <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400  rounded-xl w-80 shadow-lg justify-center h-12 mb-2`]}>
                                <ActivityIndicator color="#000" animating={loading} />
                            </TouchableOpacity>
                            :
                            <View>
                                {appleAuthAvailable &&
                                    <TouchableOpacity style={[tw`flex-row p-2.5 bg-black rounded-xl w-80 shadow-lg justify-between mb-2 justify-center `]} onPress={loginWithApple}>
                                        <Text style={[tw`text-white text-lg text-center`]}>
                                            Sign up with Apple
                                        </Text>
                                    </TouchableOpacity>
                                }
                                <TouchableOpacity style={[tw`flex-row p-2.5 bg-yellow-400 rounded-xl w-80 shadow-lg justify-between mb-2 justify-center`]} onPress={() => {
                                    googleAuth()
                                }}>
                                    {/* <Image source={require('../../assets/login_Img/google.png')} style={{
                                            flex: 1,
                                            width: null,
                                            height: null,
                                            resizeMode: 'contain'
                                        }
                                        }/> */}
                                    <Text style={[tw`text-black text-lg text-center`]}>
                                        Sign up with Google
                                    </Text>
                                </TouchableOpacity>
                            </View>

                    }

                    <View style={[tw`flex flex-row`]}>
                        <Text style={[tw`mr-2 text-lg`]}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => {
                            if (!loading) {
                                navigation.navigate("login")
                            }
                        }}>
                            <Text style={[tw`mr-2 text-lg text-blue-600 text-yellow-400`]}>Login here!</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>

        </SafeAreaView>

    )
}

export default Signup
