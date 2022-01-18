import React, { useEffect, useState, useRef, Component, Fragment } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View, StatusBar, SafeAreaView, Image } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { auth, db } from '../../config/firebaseConfig';
import MapView, { Marker, Callout } from 'react-native-maps';
import { ActivityIndicator } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions"
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios'
import * as Location from 'expo-location';
import car from "../../assets/cars/car.png"


//TODO: Implement this url https://maps.googleapis.com/maps/api/distancematrix/json?origins=%2244.23,-120.2%22|%2244,-120%22&destinations=place_id:ChIJqVJ3OCm0D4gRc9S7toT7_IY&units=imperial&key=AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak

const ReadyToGo = ({ navigation, route }) => {

    const [ready, setReady] = useState(false)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const mapRef = useRef()
    const [groupUserStartPoints, setGroupUserStartPoints] = useState([])
    const [goingToCoords, setGoingToCoords] = useState(null)
    const [locationAddress, setLocationAddress] = useState("")
    const [placeId, setPlaceId] = useState("")
    const [initalPoints, setInitialPoints] = useState([])

    const locationUnsubscribe = useRef()
    const groupUnsubscribe = useRef()
    const coordsUnsubscribe = useRef()
    const navigationUnsubscribe = useRef()
    const timeoutId = useRef()
    const setInitial = useRef(false)

    useEffect(() => {
        async function func() {
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
        if (ready) {
            getGroupStartCoords()
            checkNavigation()
            getGroup()
            getLocation()
            updateInformation()
        } else {
            unsubscribeAll()
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
                    bottom: 400,
                    right: 50,
                    top: 220,
                    left: 50,
                },
                animated: true,
            });
        } else {
            if (groupUserStartPoints.length !== 0) {
                mapRef.current.fitToCoordinates(groupUserStartPoints, {
                    edgePadding: {
                        bottom: 200,
                        right: 1,
                        top: 200,
                        left: 1,
                    },
                    animated: true,
                });
            } else {
                mapRef.current.animateCamera({ center: { latitude: 20.288954, longitude: -99.251220 }, pitch: 0, heading: 0, altitude: 0, zoom: 3.4 }, 100)
            }
        }

    }, [groupUserStartPoints, goingToCoords])

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
        if (timeoutId.current != undefined) {
            clearTimeout(timeoutId.current)
        }
    }

    const updateInformation = async () => {
        let location = await Location.getCurrentPositionAsync();

        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins="44.23,-120.2"&destinations=place_id:ChIJqVJ3OCm0D4gRc9S7toT7_IY&units=imperial&key=AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak`)
        .then(async (response) => {
            console.log('getting data from axios', await response.data.rows[0].elements[0].distance);
            if(await response.data){
                console.log("NOW HERE ACTUALLY 2")
                await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    eta: await response.data.rows[0].elements[0].duration.text,
                    distance: await response.data.rows[0].elements[0].distance.text,
                    heading: location.coords.heading
                }, {
                    merge: true
                })
            }

        })
        .catch(error => {
            console.log(error);
        });
        timeoutId.current = setTimeout(() => {updateInformation()}, 20000)
    }

    const getGroupStartCoords = () => {
        setInitial.current = false
        coordsUnsubscribe.current = db.collection("accepted").where("groupId", "==", route.params.groupId).onSnapshot(snapshot => {
            console.log("GROUP UNSUB")
            var tempArr = []
            snapshot.docs.forEach((doc) => {
                if (doc.data().ready) {
                    var coordsForDoc = {
                        latitude: parseFloat(doc.data().latitude),
                        longitude: parseFloat(doc.data().longitude),
                        userId: doc.data().userId,
                        distance: doc.data().distance,
                        name: doc.data().userName,
                        heading: doc.data().heading
                    }
                    tempArr.push(coordsForDoc)
                }
            })
            setGroupUserStartPoints(tempArr)
            if (!setInitial.current) {
                setInitial.current = true
                setInitialPoints(tempArr)
            }
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
                        locationAddress: snapshot.data().locationAddress,
                        groupOwner: route.params.groupOwner,
                        groupName: route.params.groupName,
                        userCoords: route.params.userCoords
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
        unsubscribeAll()

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

    return (
        <View style={tw`flex-1`}>
            {/* <SafeAreaView style={tw`bg-green-100`}>
                <View style={tw`flex-row justify-between px-4 items-center pb-4 rounded-b-2xl bg-black`}>
                    <View style={tw`flex-row content-center items-center`}>
                        <TouchableOpacity style={tw`py-2`} onPress={() => {
                            cancelReady()
                            setTimeout(() => {
                                navigation.goBack()
                            }, 50)
                        }
                        }>
                        <FontAwesome5 name='arrow-left' size={24} color="white" />
                        </TouchableOpacity>
                        
                        <Text style={tw`text-2xl text-white font-semibold pl-3`}>{route.params.groupName.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity style={tw`py-2`} onPress={() => {
                        unsubscribeAll()
                        navigation.navigate("addTo", {
                            groupName: route.params.groupName,
                            groupId: route.params.groupId,
                            userCoords: route.params.userCoords,
                            groupOwner: route.params.groupOwner
                        })
                    }
                    }>
                        <FontAwesome5 name='plus' size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView> */}

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
                                    //     <Marker
                                    //     coordinate={startCoords}
                                    // >
                                    //     <Image
                                    //         source={car}
                                    //         style={{ width: 30, height: 32, transform: [{
                                    //             rotate:`${heading}deg`
                                    //         }]}}
                                    //         resizeMode="contain"
                                    //     />
                                    // </Marker>
                                        <Marker
                                            key={marker.userId}
                                            coordinate={coordIn}
                                        >
                                            <Image
                                                source={car}
                                                style={{ width: 30, height: 32, transform: [{
                                                    rotate:`${marker.heading}deg`
                                                }] }}
                                                resizeMode="contain"
                                            />
                                            <Callout tooltip>
                                                <View style={tw`bg-white p-2 rounded-lg`}>
                                                    <Text>{marker.name}</Text>
                                                    <Text>{marker.eta} {marker.distance}</Text>
                                                </View>
                                            </Callout>
                                        </Marker>
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
                            goingToCoords != null &&
                            initalPoints.map((coords) => {
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
                            })

                        }
                    </MapView>
                </View>

                <View style={tw`absolute flex justify-between h-full w-full`}
                    pointerEvents="box-none">
                    <SafeAreaView style={tw`w-full bg-black rounded-b-3xl`}>
                        <View style={tw`flex-row justify-between px-4 items-center pb-4 rounded-b-3xl bg-black`}>
                            <View style={tw`flex-row content-center items-center`}>
                                <TouchableOpacity style={tw`py-2`} onPress={() => {
                                    cancelReady()
                                    setTimeout(() => {
                                        navigation.goBack()
                                    }, 50)
                                }
                                }>
                                    <FontAwesome5 name='arrow-left' size={24} color="white" />
                                </TouchableOpacity>

                                <Text style={tw`text-2xl text-white font-semibold pl-3`}>{route.params.groupName.toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity style={tw`py-2`} onPress={() => {
                                unsubscribeAll()
                                navigation.navigate("addTo", {
                                    groupName: route.params.groupName,
                                    groupId: route.params.groupId,
                                    userCoords: route.params.userCoords,
                                    groupOwner: route.params.groupOwner
                                })
                            }
                            }>
                                <FontAwesome5 name='plus' size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
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
                                    <View style={tw`flex mt-2`}>
                                        <TouchableOpacity style={tw`p-4 bg-black rounded`} onPress={() => {
                                            startNavigation()
                                        }}>
                                            <Text style={tw`font-semibold text-lg text-center text-white`}>Start Navigation</Text>
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
                                                            <TouchableOpacity style={tw`bg-black py-4 px-14 rounded-lg`} onPress={() => {
                                                                setReady(true)
                                                                confirmReady()
                                                            }}>
                                                                <Text style={tw`text-xl text-white font-semibold`}>I'm ready!</Text>
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
