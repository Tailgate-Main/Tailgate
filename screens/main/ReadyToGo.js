import React, { useEffect, useState, useRef } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { auth, db } from '../../config/firebaseConfig';
import MapView, { Marker } from 'react-native-maps';

//AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak
const ReadyToGo = ({ navigation, route }) => {

    const [ready, setReady] = useState(false)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [groupData, setGroupData] = useState(null)
    const mapRef = useRef()
    const [groupUserStartPoints, setGroupUserStartPoints] = useState([])
    const [goingToCoords, setGoingToCoords] = useState(null)

    useEffect(() => {
        async function func() {
            getGroupData()
            getReady()
            mapRef.current.animateCamera({ center: route.params.mapCoords, pitch: 0, heading: 0, altitude: 0, zoom: 18 }, 1000)
            getGroupStartCoords()
        }
        func()
    }, [])

    const getGroupData = async () => {
        var temp = await db.collection("groups").doc(route.params.groupId).get()
        setGroupData(temp.data())
    }

    const getGroupStartCoords = async () => {
        var groupCoords = await db.collection("accepted").where("groupId", "==", route.params.groupId).get()
        var tempArr = []
        groupCoords.docs.forEach((doc) => {
            console.log(doc.data())
            if (doc.data().ready) {
                var coordsForDoc = {
                    latitude: doc.data().latitude,
                    longitude: doc.data().longitude,
                    // userId: doc.data().userId
                }
                tempArr.push(coordsForDoc)
            }
        })
        console.log("WEFIUEFIUF")
        console.log(tempArr)
        setGroupUserStartPoints(tempArr)
    }

    const loadData = async () => {
        setReady(true)
        setLoading(true)

        await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
            ready: true,
            latitude: route.params.userCoords.latitude,
            longitude: route.params.userCoords.longitude
        }, {
            merge: true
        })

        const all = await db.collection("accepted").where("groupId", "==", route.params.groupId).get()

        all.docs.forEach((doc) => {
            setData(oldArray => [...oldArray, doc.data()]);
        })

        setLoading(false)
    }

    const getReady = async () => {
        const temp = await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).get()

        if (temp.data().ready) {
            setReady(true)
            loadData()
        }
    }

    return (
        <View style={tw`flex-1`}>
            <View style={tw`h-24 bg-yellow-400 `}>
                <View style={tw`mt-12 flex-row pl-3 content-center`}>
                    <Ionicons name='arrow-back' size={34} color="black" onPress={() =>
                        navigation.goBack()
                    } />
                    <Text style={tw`text-2xl font-semibold pl-2`}>{route.params.groupName.toUpperCase()}</Text>
                </View>
            </View>
            <View style={tw`h-full`}>
                <View style={tw`flex-1 relative`}>
                    <MapView
                        ref={mapRef}
                        style={tw`flex-1`}
                        provider="google"
                    >
                        {
                            groupUserStartPoints.map((marker) => {
                                console.log(marker)
                                let coordIn = {
                                    latitude: marker.latitude,
                                    longitude: marker.longitude
                                }
                                return (
                                    <Marker
                                        style={tw`flex-1`}
                                        coordinate={coordIn}
                                    />
                                )
                            })
                        }
                    </MapView>
                </View>
                <View style={tw`absolute flex justify-between h-full`} pointerEvents='box-none'>
                    <View style={tw`flex-1 m-6`} pointerEvents='box-none' keyboardShouldPersistTaps="handled"
                    >
                        <GooglePlacesAutocomplete
                            onPress={(data, details = null) => {
                                console.log("WEIYFGWEIGYF")
                                // 'details' is provided when fetchDetails = true

                                let goingToCoordsTemp = {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng
                                }
                                setGoingToCoords(goingToCoordsTemp)
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
                    <View style={tw`flex-1`}>
                        <View style={tw`bg-white flex-1 rounded-3xl `}>
                            <View style={tw`p-4 flex-1 flex`}>
                                <Text style={tw`font-semibold text-center text-3xl mb-4`}>Ready To Go</Text>
                                {
                                    !loading ?
                                        <View style={tw`flex-1`}>
                                            {
                                                ready ?
                                                    <FlatList
                                                        style={tw`flex-1`}
                                                        contentContainerStyle={tw`flex items-center`}
                                                        showsVerticalScrollIndicator={false}
                                                        showsHorizontalScrollIndicator={false}
                                                        data={data}
                                                        keyExtractor={(item) => item.userId}
                                                        numColumns={4}
                                                        renderItem={({ item }) => (
                                                            <View style={tw`m-3 flex items-center`}>
                                                                {
                                                                    item.ready ?
                                                                        <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 bg-green-300`}>
                                                                            <MaterialCommunityIcons name="human" size={24} color="black" />
                                                                        </View>
                                                                        :
                                                                        <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 bg-red-300`}>
                                                                            <MaterialCommunityIcons name="human" size={24} color="black" />
                                                                        </View>
                                                                }
                                                                <Text style={tw`uppercase text-center`}>{item.userName.slice(0, 5)}</Text>
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

                                        :
                                        <View>
                                            <Text>Loading...</Text>
                                        </View>
                                }

                            </View>
                        </View>
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
    // viewStyle: {
    //     position: 'absolute',
    //     marginTop: 20,
    //     flexDirection: "row",
    //     width: '90%',
    //     alignSelf: "center",
    //     borderRadius: 5,
    //     shadowColor: "#ccc",
    //     shadowOffset: { width: 0, height: 3 },
    //     shadowOpacity: 0.5,
    //     shadowRadius: 5,
    //     elevation: 1
    // },
})
