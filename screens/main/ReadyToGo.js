import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const ReadyToGo = ({ navigation, route }) => {

    const [ready, setReady] = useState(false)

    useEffect(() => {
        console.log(navigation)
        console.log(route)
    }, [])

    const loadData = async () => {
        //TODO: SET THE PERSON'S STATUS AS READY
        //TODO: LOAD THE DATA FROM FIREBASE
        setReady(!ready)
    }

    const data = [
        { id: 0, title: "randy moss", bgColor: "bg-blue-400", icon: "human" },
        { id: 1, title: "bbq", bgColor: "bg-blue-400", icon: "human" },
        { id: 2, title: "bbq", bgColor: "bg-blue-400", icon: "human" },
        { id: 3, title: "kpc", bgColor: "bg-pink-300", icon: "human" },
        { id: 4, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 5, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 6, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 7, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 8, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 9, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 10, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 11, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 12, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 13, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
        { id: 14, title: "mfc", bgColor: "bg-blue-400", icon: "human" },
    ]

    return (
        <View style={tw`flex-1`}>
            <View style={tw`h-24 bg-yellow-400 `}>
                <View style={tw`mt-12 flex-row pl-3 content-center`}>
                    <Ionicons name='arrow-back' size={34} color="black" onPress={() =>
                        navigation.goBack()
                    } />
                    <Text style={tw`text-2xl font-semibold pl-4`}>{route.params.groupName.toUpperCase()}</Text>
                </View>
            </View>
            <View style={tw`h-96`}>
                <Map />
                <View style={styles.viewStyle} >
                    <View style={{ flex: 1, width: '100%' }} keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ flex: 1, width: '100%' }} keyboardShouldPersistTaps="handled"
                        >
                            <GooglePlacesAutocomplete
                                onPress={(data, details = null) => {
                                    console.log("WEIYFGWEIGYF")
                                    // 'details' is provided when fetchDetails = true
                                    console.log(data, details);
                                }}
                                placeholder='Location'
                                autoFocus={false}
                                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                                fetchDetails={true}
                                enablePoweredByContainer={false}
                                query={{
                                    // available options: https://developers.google.com/places/web-service/autocomplete
                                    key: 'AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak',
                                    language: 'en', // language of the results
                                }}
                                styles={{
                                    container: {
                                        minWidth: '100%'
                                    },
                                    textInputContainer: {
                                        width: '100%',
                                    },
                                    textInput: {
                                        width: '100%',
                                    }
                                }}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <View style={tw`rounded-full flex-1`}>
                <View style={tw`bg-white h-full flex-1`}>
                    <View style={tw`p-4 flex-1 flex`}>
                        <Text style={tw`font-semibold text-center text-3xl mb-4`}>Ready To Go</Text>
                        {
                            ready ?
                                <FlatList
                                    style={tw`flex-1`}
                                    contentContainerStyle={tw`flex items-center`}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    data={data}
                                    keyExtractor={(item) => item.id}
                                    numColumns={4}
                                    renderItem={({ item }) => (

                                        <View style={tw`m-3 flex items-center`}>
                                            <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 ${item.bgColor}`}>
                                                <MaterialCommunityIcons name={item.icon} size={24} color="black" />
                                            </View>
                                            <Text style={tw`uppercase text-center`}>{item.title.slice(0, 5)}</Text>
                                        </View>
                                    )}
                                />
                                :
                                <View style={tw`flex items-center`}>
                                    <View style={tw`flex-row items-center h-52`}>
                                        <TouchableOpacity style={tw`bg-yellow-400 py-4 px-14 rounded-lg`} onPress={() => { loadData() }}>
                                            <Text style={tw`text-xl font-semibold`}>I'm ready!</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                        }
                    </View>
                </View>
            </View>
        </View>
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
        marginTop: 20,
        flexDirection: "row",
        width: '90%',
        alignSelf: "center",
        borderRadius: 5,
        shadowColor: "#ccc",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 1
    },
})
