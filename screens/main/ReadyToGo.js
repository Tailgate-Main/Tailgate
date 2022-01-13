import React, { useEffect, useState, useRef, Component, Fragment } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View, StatusBar, SafeAreaView } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { auth, db } from '../../config/firebaseConfig';
import MapView, { Marker } from 'react-native-maps';
import { ActivityIndicator } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions"
import { FontAwesome5 } from '@expo/vector-icons';

const ReadyToGo = ({ navigation, route }) => {

    const [ready, setReady] = useState(false)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const mapRef = useRef()
    const [groupUserStartPoints, setGroupUserStartPoints] = useState([])
    const [goingToCoords, setGoingToCoords] = useState(null)
    const [locationAddress, setLocationAddress] = useState("")

    const locationUnsubscribe = useRef()
    const groupUnsubscribe = useRef()
    const coordsUnsubscribe = useRef()
    const navigationUnsubscribe = useRef()


    useEffect(() => {
        async function func() {
            console.log(route.params)
            getReady()
        }
        const unsubscribe = navigation.addListener('focus', () => {
            setData([])
            setGroupUserStartPoints([])
            setGoingToCoords(null)
            setReady(false)
            func()
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        console.log("HIIIIII")
        if (ready) {
            console.log("TRIED THIS ACTUQLLY")
            getGroupStartCoords()
            console.log("HERE??ERROR1")
            checkNavigation()
            console.log("HERE??ERROR2")
            getGroup()
            console.log("HERE??ERROR3")
            getLocation()
            console.log("HERE??ERROR4")
        } else {
            console.log("HERERERR AS WELL")
            console.log(locationUnsubscribe.current)
            if (locationUnsubscribe.current != undefined) {
                console.log("TRIED????")
                locationUnsubscribe.current()
            }
            if (groupUnsubscribe.current != undefined) {
                groupUnsubscribe.current()
            }
            if (coordsUnsubscribe.current != undefined) {
                coordsUnsubscribe.current()
            }
        }
    }, [ready])

    useEffect(() => {
        if (goingToCoords) {
            let goingToTemp = goingToCoords
            let tempArr = []
            groupUserStartPoints.forEach((coords) => {
                tempArr.push(coords)
            })
            tempArr.push(goingToTemp)
            mapRef.current.fitToCoordinates(tempArr, {
                edgePadding: {
                    bottom: 200,
                    right: 50,
                    top: 50,
                    left: 50,
                },
                animated: true,
            });
        } else {
            if (groupUserStartPoints.length !== 0) {
                mapRef.current.fitToCoordinates(groupUserStartPoints, {
                    edgePadding: {
                        bottom: 1,
                        right: 1,
                        top: 100,
                        left: 1,
                    },
                    animated: true,
                });
            } else {
                mapRef.current.animateCamera({ center: { latitude: 20.288954, longitude: -99.251220 }, pitch: 0, heading: 0, altitude: 0, zoom: 3.4 }, 100)
            }
        }

    }, [groupUserStartPoints, goingToCoords])

    const getGroupStartCoords = () => {
        coordsUnsubscribe.current = db.collection("accepted").where("groupId", "==", route.params.groupId).onSnapshot(snapshot => {
            var tempArr = []
            snapshot.docs.forEach((doc) => {
                if (doc.data().ready) {
                    var coordsForDoc = {
                        latitude: parseFloat(doc.data().latitude),
                        longitude: parseFloat(doc.data().longitude),
                        userId: doc.data().userId
                    }
                    tempArr.push(coordsForDoc)
                }
            })
            setGroupUserStartPoints(tempArr)
        })
    }

    const checkNavigation = async () => {
        navigationUnsubscribe.current = db.collection("groups").doc(route.params.groupId).onSnapshot(async (snapshot) => {
            if (snapshot.data().inNavigation) {
                let coords = null
                coords = {
                    latitude: parseFloat(snapshot.data().goingTolatitude),
                    longitude: parseFloat(snapshot.data().goingTolongitude)
                }
                var groupCoords = await db.collection("accepted").where("groupId", "==", route.params.groupId).get()
                var tempArr = []
                groupCoords.docs.forEach((doc) => {
                    if (doc.data().ready) {
                        var coordsForDoc = {
                            latitude: parseFloat(doc.data().latitude),
                            longitude: parseFloat(doc.data().longitude),
                            userId: doc.data().userId
                        }
                        tempArr.push(coordsForDoc)
                    }
                })
                if (locationUnsubscribe.current != undefined) {
                    locationUnsubscribe.current()
                }
                if (groupUnsubscribe.current != undefined) {
                    groupUnsubscribe.current()
                }
                if (coordsUnsubscribe.current != undefined) {
                    coordsUnsubscribe.current()
                }
                if (navigationUnsubscribe.current != undefined) {
                    navigationUnsubscribe.current()
                }
                setTimeout(() => {
                    setLoading(false)
                    navigation.navigate("navigation", {
                        groupId: route.params.groupId,
                        groupUserStartPoints: tempArr,
                        goingToCoords: coords,
                        location: "Schaumburg,Illinois",
                        groupOwner: route.params.groupOwner,
                        groupName: route.params.groupName
                    })
                }, 500)
            }
        })
    }

    const getGroup = () => {
        groupUnsubscribe.current = db.collection("accepted").where("groupId", "==", route.params.groupId).onSnapshot(snap => {
            let tempArr = []

            snap.docs.forEach((doc) => {
                tempArr.push(doc.data())
            })
            setData(tempArr)
        })
    }

    const getLocation = () => {
        locationUnsubscribe.current = db.collection("groups").doc(route.params.groupId).onSnapshot(snapshot => {
            if (snapshot.data().goingTolatitude !== undefined) {
                if (snapshot.data().goingTolatitude != "") {
                    setGoingToCoords({
                        latitude: parseFloat(snapshot.data().goingTolatitude),
                        longitude: parseFloat(snapshot.data().goingTolongitude)
                    })
                } else {
                    setGoingToCoords(null)
                }
            } else {
                setGoingToCoords(null)
            }
        })

    }

    const confirmReady = async () => {
        await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
            ready: true,
            latitude: route.params.userCoords.latitude,
            longitude: route.params.userCoords.longitude
        }, {
            merge: true
        })
    }

    const getReady = async () => {
        const temp = await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).get()

        if (temp.data().ready) {
            setReady(true)
        } else {
            setReady(false)
        }
    }

    const cancelReady = async () => {
        if (locationUnsubscribe.current != undefined) {
            locationUnsubscribe.current()
        }
        if (groupUnsubscribe.current != undefined) {
            groupUnsubscribe.current()
        }
        if (coordsUnsubscribe.current != undefined) {
            coordsUnsubscribe.current()
        }
        if (navigationUnsubscribe.current != undefined) {
            navigationUnsubscribe.current()
        }

        await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
            ready: false,
        }, {
            merge: true
        })
        if (route.params.groupOwner) {
            await db.collection("groups").doc(route.params.groupId).set({
                goingTolatitude: "",
                goingTolongitude: ""
            }, {
                merge: true
            })
        }
    }

    const setLocation = async (details) => {
        setLocationAddress(details.formatted_address)
        console.log(details.formatted_address)
        await db.collection("groups").doc(route.params.groupId).set({
            goingTolatitude: details.geometry.location.lat,
            goingTolongitude: details.geometry.location.lng,
            locationAddress: details.formatted_address
        }, {
            merge: true
        })
    }

    const startNavigation = async () => {
        unsubscribeAll()

        if (route.params.groupOwner) {
            await db.collection("groups").doc(route.params.groupId).set({
                inNavigation: true
            }, {
                merge: true
            })
            setTimeout(() => {
                console.log("STARTED NAVIGATE")
                navigation.navigate("navigation", {
                    groupId: route.params.groupId,
                    groupUserStartPoints: groupUserStartPoints,
                    goingToCoords: goingToCoords,
                    locationAddress: locationAddress,
                    groupOwner: route.params.groupOwner,
                    groupName: route.params.groupName,
                    userCoords: route.params.userCoords,
                })
            }, 100)
        } else {
            navigation.navigate("navigation", {
                groupId: route.params.groupId,
                groupUserStartPoints: groupUserStartPoints,
                goingToCoords: goingToCoords,
                locationAddress: locationAddress,
                groupOwner: route.params.groupOwner,
                groupName: route.params.groupName,
                userCoords: route.params.userCoords,
            })
        }
    }

    const unsubscribeAll = () => {
        if (locationUnsubscribe.current != undefined) {
            locationUnsubscribe.current()
        }
        if (groupUnsubscribe.current != undefined) {
            groupUnsubscribe.current()
        }
        if (coordsUnsubscribe.current != undefined) {
            coordsUnsubscribe.current()
        }
        if (navigationUnsubscribe.current != undefined) {
            navigationUnsubscribe.current()
        }
    }

    return (
        <View style={tw`flex-1`}>
            <SafeAreaView style={tw`bg-yellow-400`}>
                <View style={tw`flex-row justify-between px-4 items-center bg-yellow-400 pb-4`}>
                    <View style={tw`flex-row content-center items-center`}>
                        <TouchableOpacity style={tw`py-2`} onPress={() => {
                            cancelReady()
                            setTimeout(() => {
                                navigation.goBack()
                            }, 50)
                        }
                        }>
                        <FontAwesome5 name='arrow-left' size={24} color="black" />
                        </TouchableOpacity>
                        
                        <Text style={tw`text-2xl font-semibold pl-3`}>{route.params.groupName.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity style={tw`py-2`} onPress={() => {
                        console.log("HERE I THINK???")
                        unsubscribeAll()
                        navigation.navigate("addTo", {
                            groupName: route.params.groupName,
                            groupId: route.params.groupId,
                            userCoords: route.params.userCoords,
                            groupOwner: route.params.groupOwner
                        })
                    }
                    }>
                        <FontAwesome5 name='plus' size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={tw`h-full flex-1`}>
                <View style={tw`flex-1 relative`}>
                    <MapView
                        ref={mapRef}
                        style={tw`flex-1`}
                        provider={PROVIDER_GOOGLE}
                    >
                        {
                            groupUserStartPoints.map((marker) => {
                                if (marker.latitude) {
                                    let coordIn = {
                                        latitude: marker.latitude,
                                        longitude: marker.longitude
                                    }
                                    return (
                                        <Marker
                                            key={marker.userId}
                                            coordinate={coordIn}
                                        />
                                    )
                                } else {
                                    return null
                                }

                            })
                        }
                        {
                            goingToCoords !== null && goingToCoords.latitude &&
                            <Marker
                                coordinate={goingToCoords}
                            />
                        }
                        {
                            goingToCoords !== null && goingToCoords.latitude &&
                            groupUserStartPoints.map((coords) => {
                                if (coords.latitude) {
                                    return (
                                        <MapViewDirections
                                            key={coords.userId}
                                            origin={{
                                                latitude: coords.latitude,
                                                longitude: coords.longitude
                                            }}
                                            destination={goingToCoords}
                                            apikey='AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak'
                                            strokeWidth={3}
                                            strokeColor='black'
                                            lineDashPattern={[0]}
                                        />
                                    )
                                } else {
                                    return null
                                }
                            })

                        }
                    </MapView>
                </View>
                <View style={tw`absolute flex justify-between h-full w-full`}
                    pointerEvents="box-none">
                    {
                        route.params.groupOwner && ready ?
                            <View style={tw`flex-1 m-6`} pointerEvents='box-none' keyboardShouldPersistTaps="handled"
                            >
                                <GooglePlacesAutocomplete
                                    onPress={(data, details = null) => {
                                        setLocation(details)
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
                                        components: 'country:us'
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
                            </View> :
                            <View style={tw`flex-1`} pointerEvents='none'></View>
                    }

                    <View style={tw`flex-1`}>
                        <View style={tw`bg-white flex-1 rounded-t-3xl`}>
                            <View style={tw`p-4 flex-1 flex`}>
                                {
                                    goingToCoords != null && route.params.groupOwner && ready &&
                                    <View style={tw`flex items-center mt-2`}>
                                        <TouchableOpacity style={tw`p-4 bg-yellow-400 rounded`} onPress={() => {
                                            startNavigation()
                                        }}>
                                            <Text style={tw`font-semibold text-lg`}>Start Navigation</Text>
                                        </TouchableOpacity>
                                    </View>

                                }
                                <Text style={tw`font-semibold text-center text-3xl mb-4 mt-4`}>Ready To Go</Text>

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
                                                            <TouchableOpacity style={tw`bg-yellow-400 py-4 px-14 rounded-lg`} onPress={() => {
                                                                setReady(true)
                                                                confirmReady()
                                                            }}>
                                                                <Text style={tw`text-xl font-semibold`}>I'm ready!</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                            }
                                        </View>
                                        :
                                        <View style={tw`w-full h-1/2`}>
                                            <View style={tw`flex-1 content-center justify-center items-center`}>
                                                <View style={tw`p-5 bg-gray-100 rounded-lg`}>
                                                    <ActivityIndicator color="#000" animating={loading} />
                                                </View>
                                            </View>
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
