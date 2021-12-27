import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5 } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList } from 'react-native-gesture-handler';
import { db, auth } from '../../config/firebaseConfig';

const Home = ({ navigation }) => {

    const [data, setData] = useState([{
        userId: 1,
        groupId: 1,
        groupName: 1
    }])

    const loadData = async () => {
        console.log(auth.currentUser.uid)
        const all = await db.collection("accepted").where("userId", "==", auth.currentUser.uid).get()
        all.docs.forEach((doc) => {
            setData(oldArray => [...oldArray, doc.data()]);
        })
    }

    useEffect(() => {
        async function func() {
            loadData()
        }
        func()
    }, [])

    return (
        <View style={tw`flex-1`}>
            <View style={tw`flex-1 relative`}>
                <Map />
            </View>
            <View style={tw`absolute w-full h-full flex justify-between flex-1`} pointerEvents='box-none'>
                <View />
                <View style={tw`h-2/5 rounded-3xl bg-white w-full`}>
                    <View style={tw`flex-1`}>
                        <Text style={tw`font-semibold text-3xl mb-2 mt-4 text-center`}>Groups</Text>

                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.groupId}
                            contentContainerStyle={tw`flex items-center`}
                            numColumns={4}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View style={tw`p-3`}>
                                    {
                                        item.groupId !== 1 ?
                                            <View>
                                                <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 bg-red-400 mb-1`}
                                                    onPress={() => {
                                                        navigation.navigate("readyToGo", {
                                                            groupName: item.groupName,
                                                            groupId: item.groupId,
                                                        })
                                                    }}>
                                                    <FontAwesome5 name="user-friends" size={24} color="black" />
                                                </TouchableOpacity>
                                                <Text style={tw`uppercase text-center`}>{item.groupName}</Text>
                                            </View>
                                            :
                                            <View>
                                                <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 bg-yellow-400`}
                                                    onPress={() => { navigation.navigate("addToGroup") }}>
                                                    <FontAwesome5 name="plus" size={24} color="black" />
                                                </TouchableOpacity>
                                            </View>
                                    }

                                </View>

                            )}

                        />


                    </View>
                </View>
            </View>
        </View>

    )
}
export default Home

{/* <View style={tw`flex-1`}>
                <View style={tw`h-1/2`}>
                    <Map />
                </View>
                <View style={tw`h-1/2 rounded-t-full flex-1`}>
                    <View style={tw`bg-white rounded-3xl h-full flex-1`}>
                        <View style={tw`flex-1`}>
                            <Text style={tw`font-semibold text-3xl mb-2 mt-4 text-center`}>Groups</Text>

                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.groupId}
                                contentContainerStyle={tw`flex items-center`}
                                numColumns={4}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={tw`p-3`}>
                                        {
                                            item.groupId !== 1 ?
                                                <View>
                                                    <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 bg-red-400 mb-1`}
                                                        onPress={() => {
                                                            navigation.navigate("readyToGo", {
                                                                groupName: item.groupName,
                                                            })
                                                        }}>
                                                        <FontAwesome5 name="user-friends" size={24} color="black" />
                                                    </TouchableOpacity>
                                                    <Text style={tw`uppercase text-center`}>{item.groupName}</Text>
                                                </View>
                                                :
                                                <View>
                                                    <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 ${item.bgColor}`}
                                                        onPress={() => { navigation.navigate("addToGroup") }}>
                                                        <FontAwesome5 name="plus" size={24} color="black" />
                                                    </TouchableOpacity>
                                                </View>
                                        }

                                    </View>

                                )}

                            />


                        </View>

                    </View>

                </View>
            </View> */}