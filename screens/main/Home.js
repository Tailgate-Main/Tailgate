import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import Map from '../../components/Map';
import Item from 'antd/lib/list/Item';
import { FlatList } from 'react-native-gesture-handler';
const Home = () => {
    const data = [
        { id: 1, bgColor: "bg-yellow-400", icon: "plus" },
        { id: 2, title: "bbq", bgColor: "bg-blue-400", icon: "user-friends" },
        { id: 3, title: "kpc", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 4, title: "mfc", bgColor: "bg-blue-400", icon: "user-friends" },
        { id: 5, title: "jhg", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 6, title: "ddq", bgColor: "bg-blue-400", icon: "user-friends" },
        { id: 7, title: "uiy", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 8, title: "ddg", bgColor: "bg-blue-400", icon: "user-friends" },
        { id: 9, title: "red", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 10, title: "der", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 11, title: "opt", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 12, title: "qwe", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 13, title: "ere", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 14, title: "pos", bgColor: "bg-pink-300", icon: "user-friends" },
        { id: 15, title: "kpl", bgColor: "bg-pink-300", icon: "user-friends" },


    ]
    return (
        <>
            <View>
                <View style={tw`h-1/2`}>
                    <Map />
                </View>
                <View style={tw`h-1/2 rounded-full`}>
                    <View style={[tw`bg-white h-full `]}>


                        <View style={tw`mt-4 flex mx-auto w-20 rounded-full`}>
                            <View style={tw` h-1 rounded-full bg-gray-400`}></View>

                        </View>
                        <View style={tw`p-4`}>
                            <Text style={tw`font-semibold text-3xl mb-4`}> Groups </Text>

                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.id}
                                numColumns={3}
                                renderItem={({ item }) => (

                                    <View style={tw`p-5`}>
                                        <TouchableOpacity style={item.bgColor} style={tw`items-center justify-center  rounded-full w-16 h-16 bg-blue-400`}>
                                            <FontAwesome5 name={item.icon} size={24} color="black" />
                                        </TouchableOpacity>
                                        <Text style={tw`uppercase text-center`}>{item.title}</Text>
                                    </View>

                                )}

                            />


                        </View>

                    </View>

                </View>
            </View>
        </>
    )
}
export default Home

const styles = StyleSheet.create({

    horizantalline: {
        width: 30,
        height: 5,
        backgroundColor: 'gray',
        flex: 0,
        alignItems: 'center',

    },

})