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
import Svg from 'react-native-svg';
import greycar from "../../assets/cars/greycar.png"
import redcar from "../../assets/cars/redcar.png"
import bluecar from "../../assets/cars/bluecar.png"
import greencar from "../../assets/cars/greencar.png"
import skybluecar from "../../assets/cars/skybluecar.png"
import pinkcar from "../../assets/cars/pinkcar.png"
import yellowcar from "../../assets/cars/yellowcar.png"

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

    const [colors, setColors] = useState(["blue", "red", "grey", "green", "pink", "yellow", "skyblue"])

    useEffect(() => {
        async function func() {
            // updateInformation()
            // getGroupStartCoords()
            // checkNavigation()
            // getGroup()
            // getLocation()
            getReady()
        }
        const unsubscribe = navigation.addListener('focus', () => {
            setData([])
            setGroupUserStartPoints([])
            setGoingToCoords(null)
            setReady(false)
            func()
            setInitial.current = false
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (ready) {
            updateInformation()
            getGroupStartCoords()
            checkNavigation()
            getGroup()
            getLocation()
        } else {
            unsubscribeAll()
        }
    }, [ready])

    // useEffect(() => {
    //     updateInformation()
    //     getGroupStartCoords()
    //     checkNavigation()
    //     getGroup()
    //     getLocation()
    // }, [])

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
            }
            else {
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
        console.log("Updating information now")
        console.log("STILL UPDATING")
        console.log(timeoutId.current)
        let location = await Location.getCurrentPositionAsync({
            maximumAge: Platform.OS === "android" && 60000, // only for Android
            accuracy: Platform.OS === "android" ? Location.Accuracy.Low : Location.Accuracy.Lowest,
        });
        console.log("HERE")
        console.log(placeId)
        if (placeId != "") {
            axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins="${location.coords.latitude},${location.coords.longitude}"&destinations=place_id:${placeId}&units=imperial&key=AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak`)
                .then(async (response) => {
                    console.log('getting data from axios', await response.data.rows[0].elements[0].distance);
                    if (await response.data) {
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
        }
        timeoutId.current = setTimeout(() => { updateInformation() }, 20000)
        
    }

    const updateInfoQuick = async (placeIdIn) => {
        let location = await Location.getCurrentPositionAsync({
            maximumAge: Platform.OS === "android" && 60000, // only for Android
            accuracy: Platform.OS === "android" ? Location.Accuracy.Low : Location.Accuracy.Lowest,
        });
        if (placeIdIn != "") {
            axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins="${location.coords.latitude},${location.coords.longitude}"&destinations=place_id:${placeIdIn}&units=imperial&key=AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak`)
                .then(async (response) => {
                    console.log('getting data from axios', await response.data.rows[0].elements[0].distance);
                    if (await response.data) {
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
        }
    }

    const getGroupStartCoords = () => {
        setInitial.current = false
        coordsUnsubscribe.current = db.collection("accepted").where("groupId", "==", route.params.groupId).onSnapshot(snapshot => {
            var tempArr = []
            snapshot.docs.forEach((doc) => {
                if (doc.data().ready) {
                    var coordsForDoc = {
                        latitude: parseFloat(doc.data().latitude),
                        longitude: parseFloat(doc.data().longitude),
                        userId: doc.data().userId,
                        distance: doc.data().distance,
                        name: doc.data().userName,
                        heading: doc.data().heading,
                        color: doc.data().color,
                        eta: doc.data().eta
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
                unsubscribeAll()
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
        let randColor = colors[Math.floor(Math.random() * colors.length)];
        await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
            ready: true,
            latitude: route.params.userCoords.latitude,
            longitude: route.params.userCoords.longitude,
            color: randColor
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
            color: "",
            eta: "",
            distance: ""
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
        setPlaceId(details.place_id)
        await db.collection("groups").doc(route.params.groupId).set({
            goingTolatitude: details.geometry.location.lat,
            goingTolongitude: details.geometry.location.lng,
            locationAddress: details.formatted_address,
            placeId: details.place_id
        }, {
            merge: true
        })
        updateInfoQuick(details.place_id)
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
                                            tracksInfoWindowChanges={true}
                                            tracksViewChanges={true}
                                            key={marker.userId}
                                            coordinate={coordIn}
                                        >
                                            {
                                                marker.color &&
                                                <Svg>
                                                    {
                                                        marker.color == "grey" &&
                                                        <Image
                                                            source={greycar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                    {
                                                        marker.color == "red" &&
                                                        <Image
                                                            source={redcar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                    {
                                                        marker.color == "blue" &&
                                                        <Image
                                                            source={bluecar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                    {
                                                        marker.color == "green" &&
                                                        <Image
                                                            source={greencar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                    {
                                                        marker.color == "skyblue" &&
                                                        <Image
                                                            source={skybluecar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                    {
                                                        marker.color == "pink" &&
                                                        <Image
                                                            source={pinkcar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                    {
                                                        marker.color == "yellow" &&
                                                        <Image
                                                            source={yellowcar}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${marker.heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                    }
                                                </Svg>

                                            }
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
                            console.log("POINTS: " + groupUserStartPoints.length + " GOING: " + goingToCoords)
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
                    <SafeAreaView style={tw`w-full bg-yellow-400 rounded-b-3xl shadow-md`}>
                        <View style={tw`flex-row justify-between px-4 items-center pb-4 rounded-b-3xl bg-yellow-400`}>
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

                                <Text style={tw`text-2xl text-black font-semibold pl-3`}>{route.params.groupName.toUpperCase()}</Text>
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
                                <FontAwesome5 name='plus' size={24} color="black" />
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
                        <View style={tw`bg-white flex-1 rounded-t-3xl shadow-md`}>
                            <View style={tw`p-4 flex-1 flex`}>
                                {
                                    goingToCoords != null && route.params.groupOwner && ready &&
                                    <View style={tw`flex`}>
                                        <TouchableOpacity style={tw`p-4 bg-yellow-400 rounded-xl`} onPress={() => {
                                            startNavigation()
                                        }}>
                                            <Text style={tw`font-semibold text-lg text-center text-black`}>Start Navigation</Text>
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
                                                                <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 bg-black shadow-lg`}>
                                                                    {
                                                                        item.ready ?
                                                                            <View style={tw`items-center justify-center rounded-full w-12 h-12 bg-black`}>
                                                                                {
                                                                                    item.color == "grey" &&
                                                                                    <Image
                                                                                        source={greycar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                                {
                                                                                    item.color == "red" &&
                                                                                    <Image
                                                                                        source={redcar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                                {
                                                                                    item.color == "blue" &&
                                                                                    <Image
                                                                                        source={bluecar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                                {
                                                                                    item.color == "green" &&
                                                                                    <Image
                                                                                        source={greencar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                                {
                                                                                    item.color == "skyblue" &&
                                                                                    <Image
                                                                                        source={skybluecar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                                {
                                                                                    item.color == "pink" &&
                                                                                    <Image
                                                                                        source={pinkcar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                                {
                                                                                    item.color == "yellow" &&
                                                                                    <Image
                                                                                        source={yellowcar}
                                                                                        style={styles.image}
                                                                                        resizeMode="contain"
                                                                                    />
                                                                                }
                                                                            </View>
                                                                            :
                                                                            <View>
                                                                                <ActivityIndicator color="#fff" animating={!item.ready} />
                                                                            </View>
                                                                    }

                                                                </View>
                                                                {
                                                                    item.userName !== undefined &&
                                                                    <Text style={tw`uppercase text-center`}>{item.userName.slice(0, 4)}</Text>
                                                                }
                                                            </View>
                                                        )}
                                                    />
                                                    :
                                                    <View style={tw`flex items-center`}>
                                                        <View style={tw`flex-row items-center h-52`}>
                                                            <TouchableOpacity style={tw`bg-yellow-400 py-4 px-14 rounded-lg shadow-lg`} onPress={() => {
                                                                setReady(true)
                                                                confirmReady()
                                                            }}>
                                                                <Text style={tw`text-xl text-black font-semibold`}>I'm ready!</Text>
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

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
    }
})