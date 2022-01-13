import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../../config/firebaseConfig';

const AddToGroup = ({ navigation, route }) => {
    const [groupName, setGroupName] = useState("")
    const [groupMembers, setGroupMembers] = useState([])
    const [addMember, setAddMember] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        console.log(route.params.groupId)
        setGroupName(route.params.groupName)
    }, [])

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

    const sendRequests = async () => {
        if (groupMembers.length !== 0) {
            setLoading(true)
            groupMembers.map(async (val) => {
                await db.collection("requests").doc(val + "-" + route.params.groupId).set({
                    groupId: route.params.groupId,
                    groupName: groupName,
                    groupOwnerName: auth.currentUser.displayName,
                    groupOwner: auth.currentUser.uid,
                    userEmail: val
                })
            })
            setTimeout(() => {
                setLoading(false)
                navigation.navigate("readyToGo", {
                    groupName: route.params.groupName,
                    groupId: route.params.groupId,
                    userCoords: route.params.userCoords,
                    groupOwner: route.params.groupOwner
                })
            }, 500)
        }
    }

    return (
        <View style={tw`bg-white flex-1`}>
            <SafeAreaView style={tw`mx-4 flex-1`}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-col justify-between flex-1`}>
                    <View style={tw`flex-1`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <View style={tw`flex-row items-center`}>
                                <TouchableOpacity style={tw`rounded-full mr-4 py-2`} onPress={() => {
                                    navigation.navigate("readyToGo", {
                                        groupName: route.params.groupName,
                                        groupId: route.params.groupId,
                                        userCoords: route.params.userCoords,
                                        groupOwner: route.params.groupOwner
                                    })
                                }}>
                                    <FontAwesome5 name="arrow-left" size={24} color="black" />
                                </TouchableOpacity>
                                <Text style={tw`text-3xl font-bold`}>ADD TO GROUP</Text>
                            </View>
                            {
                                loading ?
                                    <View style={tw`bg-yellow-400 p-4 rounded-full`}>
                                        <ActivityIndicator color="#000" animating={loading} />
                                    </View>
                                    :

                                    <TouchableOpacity style={tw`bg-yellow-400 p-4 rounded-full`} onPress={() => {
                                        sendRequests()
                                    }}>
                                        <FontAwesome5 name="check" size={24} color="black" />
                                    </TouchableOpacity>
                            }

                        </View>
                        <TextInput
                            style={[tw`bg-white border-2 border-black rounded-xl w-full h-12 pl-2 pr-2 mb-4 mt-4`]}
                            placeholder="Group Name"
                            editable={false}
                            value={groupName}
                        />
                        <View style={tw`flex-1`}>
                            <ScrollView style={tw``} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                                {
                                    groupMembers.map((val, i) => {
                                        return (
                                            <View style={tw`flex-row items-center pb-4`} key={i}>
                                                <TextInput
                                                    style={[tw`bg-white border-2 border-black rounded-xl pl-2 pr-2 flex-1 h-12`]}
                                                    value={val}
                                                    editable={false}
                                                />
                                                <TouchableOpacity style={tw`ml-2`}
                                                    onPress={() => {
                                                        handleDeleteMember(i)
                                                    }}>
                                                        <View style={tw`bg-yellow-400 flex justify-center  flex-1 p-2 rounded-lg`}>
                                                        <Text>Delete</Text>

                                                        </View>
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
                                    if (addMember != auth.currentUser.email) {
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

export default AddToGroup
