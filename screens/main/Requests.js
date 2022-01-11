import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { auth, db } from '../../config/firebaseConfig';

const Requests = ({ navigation }) => {
    const [requests, setRequests] = useState([])

    let unsubscribe = null

    useEffect(() => {
        async function func() {
            let tempArr = []
            unsubscribe = db.collection("requests").where("userEmail", "==", auth.currentUser.email).onSnapshot(snapshot => {
                tempArr = []
                snapshot.docs.forEach(function (doc) {
                    tempArr.push(doc.data())
                });
                setRequests(tempArr)
            })
            
        }

        func()
    }, [])

    const acceptRequest = async (data, index) => {
        let temp = []
        requests.map((val) => {
            temp.push(val)
        })
        const rand = await db.collection("requests").doc(auth.currentUser.email + "-" + data.groupId).get()
        const owner = rand.data().groupOwner
        await db.collection("requests").doc(auth.currentUser.email + "-" + data.groupId).delete()
        setTimeout(async () => {
            await db.collection("accepted").doc(auth.currentUser.uid + "-" + data.groupId).set({
                groupId: data.groupId,
                groupName: data.groupName,
                ready: false,
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName,
                groupOwner: owner
            })
        }, 500)
    }

    const rejectRequest = async (data, index) => {
        console.log("QIEUHAEILUHFEIULH")
        console.log(data)
        await db.collection("requests").doc(auth.currentUser.email + "-" + data.groupId).delete()
    }

    return (
        <View style={"h-full bg-white"}>
            <SafeAreaView style={tw`${Platform.OS === "android" && "mt-2"}`}>
                <View style={tw`p-4`}>
                    <View style={tw`flex-row items-center`}>
                        <TouchableOpacity style={tw`rounded-full mr-4`} onPress={() => {
                            if(unsubscribe != null){
                                unsubscribe()
                            }
                            navigation.navigate("home")
                        }}>
                            <FontAwesome5 name="arrow-left" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={tw`text-3xl font-bold`}>Group Requests</Text>
                    </View>
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
                                                acceptRequest(val, i)
                                            }}>
                                                <Text>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={tw`flex-row bg-black p-2 rounded-lg`} onPress={() => {
                                                rejectRequest(val, i)
                                            }}>
                                                <Text style={tw`text-yellow-400`}>Reject</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default Requests
