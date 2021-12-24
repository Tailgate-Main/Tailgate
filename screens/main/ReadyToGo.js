import React, { useLayoutEffect } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList, TextInput } from 'react-native-gesture-handler';
const ReadyToGo = ({ navigation }) => {
    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'BBQ',
            headerTitleStyle: {
                color: '#000000',
            },
            headerStyle: {
                backgroundColor: '#FFBA01',

            },
            headerLeft: () => <Ionicons name='ios-arrow-back' size={24} color="black" />,
        });
    }, [navigation]);
    const data = [
        { id: 0, title: "bbq", bgColor: "bg-blue-400", icon: "human" },
        { id: 1, title: "bbq", bgColor: "bg-blue-400", icon: "human" },
        { id: 2, title: "bbq", bgColor: "bg-blue-400", icon: "human" },
        { id: 3, title: "kpc", bgColor: "bg-pink-300", icon: "human" },
        { id: 4, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },

        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },



    ]
    return (
        <>
            <View style={tw`flex-1`}>
                <View style={tw`h-96`}>
                    <Map />
                    <View style={styles.viewStyle}>
                        <TextInput
                            style={{ fontSize: 12 }}
                            placeholder='Where to?'
                            placeholderTextColor="#000"
                            autoCapitalize='none'
                            style={{ flex: 1, padding: 0 }}
                        >
                        </TextInput>
                        <Ionicons name='ios-search' size={24} color="black" />
                    </View>
                </View>
                <View style={tw`rounded-full flex-1`}>
                    <View style={tw`bg-white h-full flex-1`}>
                        <View style={tw`p-4 flex-1`}>
                            <Text style={tw`font-semibold text-center text-3xl mb-4`}> Ready To Go </Text>

                            <FlatList
                                style={[tw`flex-1`]}
                                data={data}
                                keyExtractor={(item) => item.id}
                                numColumns={4}
                                renderItem={({ item }) => (

                                    <View style={tw`p-3`}>
                                        <TouchableOpacity style={item.bgColor} style={tw`items-center justify-center  rounded-full w-16 h-16 bg-blue-400`}>
                                            <MaterialCommunityIcons name={item.icon} size={24} color="black" />
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
export default ReadyToGo

const styles = StyleSheet.create({

    horizantalline: {
        width: 30,
        height: 5,
        backgroundColor: 'gray',
        flex: 0,
        alignItems: 'center',

    },
    viewStyle: {
        position: 'absolute',
        marginTop: Platform.OS == 'android' ? 40 : 20,
        flexDirection: "row",
        backgroundColor: "#fff",
        width: '90%',
        alignSelf: "center",
        borderRadius: 5,
        padding: 10,
        shadowColor: "#ccc",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
    },
})
