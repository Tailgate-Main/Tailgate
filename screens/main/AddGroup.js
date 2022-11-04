import React, { useState } from 'react'
import { View, Text, FlatList, ScrollView, StyleSheet, KeyboardAvoidingView, SafeAreaView } from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../../config/firebaseConfig'
import uuid from 'react-native-uuid'
import { ActivityIndicator } from 'react-native';

const AddGroup = ({ navigation, route }) => {

    const [groupName, setGroupName] = useState("")
    const [groupMembers, setGroupMembers] = useState([])
    const [addMember, setAddMember] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAddMember = (e) => {
        let tempArr = []
        groupMembers.map((val) => {
            tempArr.push(val)
        })
        tempArr.push(e.toLowerCase())
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
        console.log(auth.currentUser.displayName)
        if (groupName != "") {
            if (groupMembers.length !== 0) {
                setLoading(true)

                var id = uuid.v1().replace(/-/g, '')

                await db.collection("groups").doc(id).set({
                    groupId: id,
                    groupOwner: auth.currentUser.uid,
                    groupName: groupName
                })

                groupMembers.map(async (val, i) => {
                    await db.collection("requests").doc(val + "-" + id).set({
                        groupId: id,
                        groupName: groupName,
                        groupOwnerName: auth.currentUser.displayName,
                        groupOwner: auth.currentUser.uid,
                        userEmail: val.toLowerCase()
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
                    setLoading(false)
                    navigation.navigate("home")
                }, 500)
            }else{
                alert("No members added")
            }
        }else{
            alert("No group name set")
        }
    }

    return (
        <View style={tw`bg-white h-full`}>
            <SafeAreaView style={tw`mx-4 flex-1 ${Platform.OS === "android" && "mt-4"}`}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-col justify-between flex-1`}>
                    <View style={tw`flex-1`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <View style={tw`flex-row items-center`}>
                                <TouchableOpacity style={tw`rounded-full mr-4`} disabled={loading} onPress={() => {
                                    navigation.navigate("home")
                                }}>
                                    <FontAwesome5 name="arrow-left" size={24} color="black" />
                                </TouchableOpacity>
                                <Text style={tw`text-3xl font-bold`}>ADD GROUP</Text>
                            </View>
                            {
                                loading ?
                                    <View style={tw`bg-yellow-400 h-14 w-14 flex-row justify-center items-center rounded-full shadow-md`}>
                                        <ActivityIndicator color="#000" animating={loading} />
                                    </View>
                                    :
                                    <TouchableOpacity style={tw`bg-yellow-400 flex-row justify-center items-center h-14 w-14 rounded-full shadow-md`} onPress={() => {
                                        createGroup()
                                    }}>
                                        <FontAwesome5 name="check" size={24} color="black" />
                                    </TouchableOpacity>
                            }

                        </View>
                        <TextInput
                            style={[tw`bg-white shadow-md rounded-xl w-full h-12 pl-2 pr-2 mb-4 mt-4 shadow-md`]}
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
                                                    style={[tw`bg-white rounded-xl flex-1 pl-2 pr-2 h-12 shadow-md`]}
                                                    value={val}
                                                    autoCapitalize="none"
                                                    editable={false}
                                                />
                                                <TouchableOpacity style={tw`flex justify-center p-2 flex-1 bg-yellow-400 ml-2 rounded-lg shadow-md`}
                                                    onPress={() => {
                                                        handleDeleteMember(i)
                                                    }}>
                                                    <Text style={tw`text-black`}>Delete</Text>
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
                            style={[tw`bg-white shadow-md rounded-xl pl-2 pr-2 h-12`]}
                            placeholder="Member Email"
                            onChangeText={(e) => { setAddMember(e) }}
                            value={addMember}
                        />
                        <View style={tw`flex-row items-center justify-center mt-2`} >
                            <TouchableOpacity style={tw`items-center justify-center flex rounded-full p-4 bg-yellow-400 shadow-md`} onPress={() => {
                                let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
                                if (reg.test(addMember) === true) {
                                    if (addMember.toLowerCase() != auth.currentUser.email) {
                                        if (addMember !== "") {
                                            handleAddMember(addMember)
                                            setAddMember("")
                                        }
                                    }else{
                                        alert("Cannot add yourself to a group")
                                    }
                                }else{
                                    alert("Email badly formatted")
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
