import React, { useState } from 'react'
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, StyleSheet} from 'react-native'
import tw from 'tailwind-react-native-classnames';
import { auth, db } from '../../config/firebaseConfig';

const Signup = ({navigation}) => {
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

    return (
        <SafeAreaView style={[tw`bg-white h-full`]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={tw`flex-1`}>
                <View style={[tw`m-auto flex items-center`]}>
                    <TextInput
                        style={[tw`border-2 border-black rounded-xl w-80 h-12 mb-4 pl-2 pr-2`]}
                        onChangeText={(e) => { setEmail(e) }}
                        value={email}
                    />
                    <TextInput
                        style={[tw`border-2 border-black rounded-xl w-80 h-12 pl-2 pr-2 mb-4`]}
                        onChangeText={(e) => { setPassword(e) }}
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
                        <TouchableOpacity onPress={() => {navigation.navigate("login")}}>
                            <Text style={[tw`mr-2 text-lg text-blue-600`]}>Login here!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>

    )
}

export default Signup
