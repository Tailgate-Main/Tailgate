import React, { useEffect, useRef, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { auth, db } from '../../config/firebaseConfig';

const Requests = ({ navigation }) => {
    const [requests, setRequests] = useState([])

    let requestUnsubscribe = useRef()

    useEffect(() => {
        async function func() {
            getRequests()
        }
        func()
    }, [])

    const getRequests = () => {
        let tempArr = []
        requestUnsubscribe.current = db.collection("requests").where("userEmail", "==", auth.currentUser.email).onSnapshot(snapshot => {
            tempArr = []
            snapshot.docs.forEach(function (doc) {
                tempArr.push(doc.data())
            });
            setRequests(tempArr)
        })
    }

    const acceptRequest = async (data) => {
        let temp = []
        requests.map((val) => {
            temp.push(val)
        })
        const rand = await db.collection("requests").doc(auth.currentUser.email + "-" + data.groupId).get()
        await db.collection("requests").doc(auth.currentUser.email + "-" + data.groupId).delete()
        setTimeout(async () => {
            await db.collection("accepted").doc(auth.currentUser.uid + "-" + data.groupId).set({
                groupId: data.groupId,
                groupName: data.groupName,
                ready: false,
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName,
            })
        }, 500)
    }

    const rejectRequest = async (data) => {
        await db.collection("requests").doc(auth.currentUser.email + "-" + data.groupId).delete()
    }

    return (
        <SafeAreaView style={tw`${Platform.OS === "android" && "mt-2"}`}>
            <View style={tw`p-4`}>
                <View style={tw`flex-row items-center`}>
                    <TouchableOpacity style={tw`rounded-full mr-4`} onPress={() => {
                        if (requestUnsubscribe.current != undefined) {
                            requestUnsubscribe.current()
                        }
                        navigation.navigate("home")
                    }}>
                        <FontAwesome5 name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={tw`text-3xl font-bold`}>Group Requests</Text>
                </View>
                {
                    requests.length !== 0 ?
                    <ScrollView style={tw`h-full mt-4`}>
                        {
                            requests.map((val, i) => {
                                return (
                                    <View key={val.groupId} style={tw`flex-row justify-between my-2`}>
                                        <View>
                                            <Text style={tw`text-xl font-semibold`}>{val.groupName}</Text>
                                            <Text>Invite from {val.groupOwnerName}</Text>
                                        </View>

                                        <View style={tw`flex-row items-center`}>
                                            <TouchableOpacity style={tw`flex-row bg-yellow-400 p-2 rounded-lg mr-2`} onPress={() => {
                                                acceptRequest(val)
                                            }}>
                                                <Text>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={tw`flex-row bg-black p-2 rounded-lg`} onPress={() => {
                                                rejectRequest(val)
                                            }}>
                                                <Text style={tw`text-yellow-400`}>Reject</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                    :
                    <View style={tw``} />
                }
            </View>
        </SafeAreaView>
    )
}

export default Requests
