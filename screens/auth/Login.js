import React, {useState} from 'react'
import { View, Text, SafeAreaView, KeyboardAvoidingView, TouchableOpacity, TextInput } from 'react-native'
import { auth } from '../../config/firebaseConfig';
import tw from "tailwind-react-native-classnames"

const Login = ({navigation}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const handleLogin = async () => {
        await auth.signInWithEmailAndPassword(email, password)
        console.log("HELLOOOOOOOO")
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
                    <TouchableOpacity style={[tw`flex items-center p-2.5 bg-black rounded-xl w-80 mb-2`]} onPress={() => { handleLogin() }}>
                        <Text style={[tw`text-white text-lg`]}>
                            Login
                        </Text>
                    </TouchableOpacity>
                    <View style={[tw`flex flex-row`]}>
                        <Text style={[tw`mr-2 text-lg`]}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => {navigation.navigate("signup")}}>
                            <Text style={[tw`mr-2 text-lg text-blue-600`]}>Signup here!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>

    )
}


export default Login
