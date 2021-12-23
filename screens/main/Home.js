import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import Map from '../../components/Map';
import Item from 'antd/lib/list/Item';
import { FlatList } from 'react-native-gesture-handler';

const Home = () => {
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
                                data={}
                            >
                                <View style={tw``}>
                                    <TouchableOpacity style={tw`items-center justify-center rounded-full w-16 h-16 bg-yellow-400`}>
                                        <Entypo name="plus" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>
                                <View style={tw``}>
                                    <TouchableOpacity style={tw`items-center justify-center rounded-full w-16 h-16 bg-blue-400`}>
                                        <FontAwesome5 name="user-friends" size={24} color="black" />
                                    </TouchableOpacity>
                                    <Text style={tw`uppercase text-center`}>bbq</Text>
                                </View>
                                <View style={tw``}>
                                    <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 bg-pink-300`}>
                                        <FontAwesome5 name="user-friends" size={24} color="black" />
                                    </TouchableOpacity>
                                    <Text style={tw`uppercase text-center`}>dine</Text>
                                </View>
                            </FlatList>
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