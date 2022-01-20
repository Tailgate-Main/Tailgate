import React, { useEffect, useRef, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { auth, db } from '../../config/firebaseConfig'
import { FontAwesome5 } from '@expo/vector-icons';
import groupcar from "../../assets/cars/groupcar.png"

const Settings = ({ navigation }) => {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    const [data, setData] = useState([])
    const groupsUnsubscribe = useRef()

    useEffect(() => {
        setName(auth.currentUser.displayName)
        setEmail(auth.currentUser.email)
        getGroupData()
        console.log("THE USER")
        console.log(auth.currentUser)
    }, [auth.currentUser])

    const navigateBack = () => {
        unsubscribe()
        navigation.navigate("home")
    }

    const unsubscribe = () => {
        console.log(groupsUnsubscribe.current)
        if(groupsUnsubscribe.current != undefined){
            console.log("hereree?")
            groupsUnsubscribe.current()
        }
    }

    const leaveGroup = async (groupId) => {
        await db.collection("accepted").doc(auth.currentUser.uid + "-" + groupId).delete()
    }

    const getGroupData = () => {
        groupsUnsubscribe.current = db.collection("accepted").where("userId", "==", auth.currentUser.uid).onSnapshot(snapshot => {
            let tempArr = []
            snapshot.docs.forEach((doc) => {
                tempArr.push(doc.data())
            })
            setData(tempArr)
        })
    }

    const logout = async () => {
        try {
            await auth.signOut()
        }catch(e){
            console.log(e)
        }
    }

    return (
        <SafeAreaView style={tw`mx-4 flex-1 ${Platform.OS === "android" && "mt-4"}`}>
            <View style={tw`flex-row items-center mb-6`}>
                <TouchableOpacity style={tw`mr-4`} onPress={() => {
                    navigateBack()
                }
                }>
                    <FontAwesome5 name='arrow-left' size={24} color="black" />
                </TouchableOpacity>
                <Text style={tw`text-3xl font-bold`}>Settings</Text>

            </View>
            <View style={tw`flex-row justify-between items-center mb-6`}>
                <View>
                    <Text style={tw`text-2xl font-semibold`}>{name}</Text>
                    <Text style={tw`text-lg font-semibold`}>{email}</Text>
                </View>
                <View>
                    <TouchableOpacity style={tw`flex-1 bg-yellow-400 flex justify-center items-center rounded-lg p-2`} onPress={async () => {
                        unsubscribe()
                        await logout()
                        navigation.navigate("login")
                    }}>
                        <Text style={tw`text-lg font-semibold`}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={tw`w-full h-px bg-yellow-400 mb-6`} />
            <View>
                <Text style={tw`text-xl font-semibold text-center`}>Groups</Text>
                {
                    data !== [] &&
                    <FlatList
                    data={data}
                    keyExtractor={(item) => item.groupId}
                    contentContainerStyle={tw`flex items-center w-full`}
                    numColumns={4}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={tw`py-3 px-3`}>
                            <View>
                                <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 bg-black shadow-lg`}>

                                    <View style={tw`items-center justify-center rounded-full w-10 h-10 bg-black`}>
                                        <Image
                                            source={groupcar}
                                            style={styles.image}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                                <Text style={tw`uppercase text-center mb-2`}>{item.groupName.slice(0, 5)}</Text>
                                <TouchableOpacity style={tw`bg-yellow-400 p-2 rounded-lg`} onPress={() => {
                                    leaveGroup(item.groupId)
                                }}>
                                    <Text style={tw`text-center`}>Leave</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    )}

                />
                }
                
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
    }
});


export default Settings
