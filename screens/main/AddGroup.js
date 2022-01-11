import React, { useState } from 'react'
import { View, Text, FlatList, ScrollView, StyleSheet, KeyboardAvoidingView } from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../../config/firebaseConfig'
import uuid from 'react-native-uuid'

const AddGroup = ({ navigation, route }) => {

    const [groupName, setGroupName] = useState("")
    const [groupMembers, setGroupMembers] = useState([])
    const [addMember, setAddMember] = useState("")

    const handleAddMember = (e) => {
        let tempArr = []
        groupMembers.map((val) => {
            tempArr.push(val)
        })
        tempArr.push(e)
        setGroupMembers(tempArr)
    }

    const handleDeleteMember = (index) => {
        let tempArr = []
        groupMembers.map((val) => {
            tempArr.push(val)
        })
        tempArr.splice(index, 1)
        setGroupMembers(tempArr)
    }

    const createGroup = async () => {
        if(groupName != "" && groupMembers.length !== 0){
            var id = uuid.v1().replace(/-/g, '')

            await db.collection("groups").doc(id).set({
                groupId: id,
                groupOwner: auth.currentUser.uid,
                inNavigatoin: false,
                groupName: groupName
            })

            groupMembers.map(async (val, i) => {
                await db.collection("requests").doc(val + "-" + id).set({
                    groupId: id,
                    groupName: groupName,
                    groupOwnerName: auth.currentUser.displayName,
                    groupOwner: auth.currentUser.uid,
                    userEmail: val
                })
            })

            await db.collection("accepted").doc(auth.currentUser.uid + "-" + id).set({
                groupId: id,
                groupName: groupName,
                ready: false,
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName,
                groupOwner: auth.currentUser.uid
            })

            setTimeout(() => {
                navigation.navigate("home")
            }, 500)
        }
    }

    return (
        <View style={tw`bg-white h-full`}>
            <SafeAreaView style={tw`px-4 flex-1 ${Platform.OS === "android" && "mt-4"}`}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-col justify-between flex-1`}>
                    <View style={tw`flex-1`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <View style={tw`flex-row items-center`}>
                                <TouchableOpacity style={tw`rounded-full mr-4`} onPress={() => {
                                    navigation.navigate("home")
                                }}>
                                    <FontAwesome5 name="arrow-left" size={24} color="black" />
                                </TouchableOpacity>
                                <Text style={tw`text-3xl font-bold`}>ADD GROUP</Text>
                            </View>
                            <TouchableOpacity style={tw`bg-yellow-400 p-4 rounded-full`} onPress={() => {
                                createGroup()
                            }}>
                                <FontAwesome5 name="check" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[tw`bg-white border-2 border-black rounded-xl w-full h-12 pl-2 pr-2 mb-4 mt-4`]}
                            placeholder="Group Name"
                            onChangeText={(e) => { setGroupName(e) }}
                            value={groupName}
                        />
                        <View style={tw`flex-1`}>
                            <ScrollView style={tw``} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                                {
                                    groupMembers.map((val, i) => {
                                        return (
                                            <View style={tw`flex-row items-center pb-4`} key={i}>
                                                <TextInput
                                                    style={[tw`bg-white border-2 border-black rounded-xl flex-1 pl-2 pr-2 h-12`]}
                                                    value={val}
                                                    editable={false}
                                                />
                                                <TouchableOpacity style={tw`flex justify-center p-2 flex-1 bg-yellow-400 ml-2 rounded-lg`}
                                                    onPress={() => {
                                                        handleDeleteMember(i)
                                                    }}>
                                                    <Text>Delete</Text>
                                                </TouchableOpacity>
                                            </View>

                                        )
                                    })
                                }
                            </ScrollView>
                        </View>

                    </View>
                    <View style={tw`w-full pb-4 pt-2`}>
                        <TextInput
                            style={[tw`bg-white border-2 border-black rounded-xl pl-2 pr-2 h-12`]}
                            placeholder="Member Email"
                            onChangeText={(e) => { setAddMember(e) }}
                            value={addMember}
                        />
                        <View style={tw`flex-row items-center justify-center mt-2`} >
                            <TouchableOpacity style={tw`items-center justify-center flex rounded-full p-4 bg-yellow-400`} onPress={() => {
                                let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
                                if (reg.test(addMember) === true) {
                                    if(addMember != auth.currentUser.email){
                                        if (addMember !== "") {
                                            handleAddMember(addMember)
                                            setAddMember("")
                                        }
                                    }
                                }
                            }}>
                                <FontAwesome5 name="plus" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    )
}

export default AddGroup
