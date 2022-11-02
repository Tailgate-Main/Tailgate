import { View, Text, SafeAreaView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import tw from "tailwind-react-native-classnames"
import { db, auth } from '../../config/firebaseConfig';

const SetName = ({ navigation }) => {
    const [name, setName] = useState("")

    const updateName = async () => {
        const user = auth.currentUser
        console.log(user)
        await db.collection("users").doc(user.email).set(
            {
                userName: name,
            }, {merge: true})
        await auth.currentUser.updateProfile({
            displayName: name
        });
        setTimeout(() => {
            navigation.navigate("home")
        }, 200)
    }

    return (
        <SafeAreaView style={[tw`bg-white h-full`]}>
            <View style={tw`flex-1`}>
                <View style={[tw`m-auto flex items-center`]}>
                    <Text style={[tw`text-black text-3xl font-semibold mb-2`]}>Set your name</Text>
                    <View style={[tw`w-full`]}>
                        <TextInput style={[tw`border-2 rounded-xl w-80 shadow-lg justify-between mb-2 py-4 px-4`]} value={name} onChangeText={setName} placeholder="Name"/>
                        <TouchableOpacity style={[tw`p-2.5 bg-yellow-400 rounded-xl w-80 shadow-lg justify-between mb-2 px-14`]} onPress={() => {
                            updateName()
                        }}>
                            <Text style={[tw`text-black text-lg text-center`]}>
                                Let's go!
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </SafeAreaView>
    )
}

export default SetName