import React, { useEffect, useRef, useState } from 'react'
import { View, Text, ActivityIndicator, FlatList, Image } from 'react-native'
import Map from '../../components/Map'
import tw from 'tailwind-react-native-classnames'
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { auth, db } from '../../config/firebaseConfig'
import { StyleSheet } from 'react-native'
import * as Location from 'expo-location';
import axios from 'axios'
import Svg from 'react-native-svg';
import greycar from "../../assets/cars/greycar.png"
import redcar from "../../assets/cars/redcar.png"
import bluecar from "../../assets/cars/bluecar.png"
import greencar from "../../assets/cars/greencar.png"
import skybluecar from "../../assets/cars/skybluecar.png"
import pinkcar from "../../assets/cars/pinkcar.png"
import yellowcar from "../../assets/cars/yellowcar.png"

const Navigation = ({ navigation, route }) => {

    const mapRef = useRef()

    const [groupUserStartPoints, setGroupUserStartPoints] = useState(null)
    const [goingToCoords, setGoingToCoords] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [locationAddress, setLocationAddress] = useState("")
    const [initalPoints, setInitialPoints] = useState([])
    const [placeId, setPlaceId] = useState("")

    // const [data, setData] = useState([])

    const locationUnsubscribe = useRef()
    const coordsUnsubscribe = useRef()
    const timeoutId = useRef()
    const setInitial = useRef(false)
    // const groupUnsubscribe = useRef()

    useEffect(() => {
        // setLocationAddress(route.params.locationAddress)
        // setGroupUserStartPoints(route.params.groupUserStartPoints)
        setGoingToCoords(route.params.goingToCoords)
        // setPlaceId(route.params.placeId)
        getLocation()
        getGroupStartCoords()
        updateInformation()

    }, [])

    useEffect(() => {
        if (groupUserStartPoints != null && goingToCoords != null) {
            let goingToTemp = goingToCoords
            let tempArr = []
            groupUserStartPoints.forEach((coords) => {
                tempArr.push(coords)
            })
            tempArr.push(goingToTemp)
            mapRef.current.fitToCoordinates(tempArr, {
                edgePadding: {
                    bottom: 250,
                    right: 75,
                    top: 100,
                    left: 75,
                },
                animated: true,
            });
        }
    }, [groupUserStartPoints, goingToCoords])

    // useEffect(() => {
    //     console.log("INNAVIGATION")
    //     if (inNavigation) {
    //         getLocation()
    //         getGroupStartCoords()
    //         updateInformation()
    //     } else {
    //         unsubscribeAll()
    //     }
    // }, [inNavigation])

    const unsubscribeAll = () => {
        if (locationUnsubscribe.current != undefined) {
        
            locationUnsubscribe.current()
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
        if (placeId != "") {
            axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins="${location.coords.latitude},${location.coords.longitude}"&destinations=place_id:${placeId}&units=imperial&key=AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak`)
                .then(async (response) => {
                    if (await response.data) {
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
                    if (await response.data) {
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

    const getLocation = () => {
        locationUnsubscribe.current = db.collection("groups").doc(route.params.groupId).onSnapshot(snapshot => {
            setLocationAddress(snapshot.data().locationAddress)
            if (snapshot.data().goingTolatitude !== undefined) {
                if (snapshot.data().goingTolatitude != "") {
                    setInitial.current = false
                    setGoingToCoords({
                        latitude: parseFloat(snapshot.data().goingTolatitude),
                        longitude: parseFloat(snapshot.data().goingTolongitude)
                    })
                    setPlaceId(snapshot.data().placeId)
                    setLocationAddress(snapshot.data().locationAddress)
                    updateInfoQuick(snapshot.data().placeId)
                } else {
                    setGoingToCoords(null)
                    // setInNavigation(false)
                    setPlaceId("")
                }
            } else {
                setGoingToCoords(null)
                // setInNavigation(false)
            }
        })
    }

    const getGroupStartCoords = () => {
        coordsUnsubscribe.current = db.collection("accepted").where("groupId", "==", route.params.groupId).onSnapshot(snapshot => {
            var tempArr = []
            snapshot.docs.forEach((doc) => {
                if (doc.data().isNavigating) {
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
                    setInitial.current = false
                }
            })
            setGroupUserStartPoints(tempArr)
            if (!setInitial.current) {
                setInitial.current = true
                setInitialPoints(tempArr)
            }
        })
    }

    const goBack = async () => {
        setIsLoading(true)
        unsubscribeAll()
        if (groupUserStartPoints != null) {
            if (groupUserStartPoints.length == 1) {
                await db.collection("groups").doc(route.params.groupId).set({
                    goingTolatitude: "",
                    goingTolongitude: "",
                    locationAddress: "",
                    placeId: ""
                }, {
                    merge: true
                })
            }
        }


        // if (route.params.groupOwner) {
        //     setIsLoading(true)
        //     // await groupUserStartPoints.forEach((marker) => {
        //     //     db.collection("accepted").doc(marker.userId + "-" + route.params.groupId).set({
        //     //         ready: false,
        //     //         isNavigating: false
        //     //     }, {
        //     //         merge: true
        //     //     })
        //     // })
        //     // await db.collection("groups").doc(route.params.groupId).set({
        //     //     goingTolatitude: "",
        //     //     goingTolongitude: "",
        //     //     inNavigation: false,
        //     //     locationAddress: "",
        //     //     placeId: "",
        //     //     distance: "",
        //     //     eta: ""
        //     // }, {
        //     //     merge: true
        //     // })
        // } else {
        //     await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
        //         ready: false,
        //         isNavigating: false
        //     }, {
        //         merge: true
        //     })
        // }
        await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
            ready: false,
            isNavigating: false
        }, {
            merge: true
        })
        setTimeout(() => {
            setIsLoading(false)
            navigation.navigate("readyToGo", {
                groupId: route.params.groupId,
                userCoords: route.params.userCoords,
                groupName: route.params.groupName
            })
        }, 500)
    }

    return (
        <View style={tw`flex-1`}>
            <View style={tw`flex-1 h-full relative`}>
                <MapView
                    ref={mapRef}
                    style={tw`flex-1`}
                    provider={PROVIDER_GOOGLE}
                >
                    {
                        groupUserStartPoints &&
                        groupUserStartPoints.map((marker) => {
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
                        })
                    }
                    {
                        goingToCoords != null &&
                        <Marker
                            style={tw`flex-1`}
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
            <View style={tw`absolute flex justify-between h-full w-full flex-1`} pointerEvents='box-none'>
                <View></View>
                <View style={tw`bg-white shadow-md pb-8 pt-4 pl-8 pr-8 rounded-t-3xl`}>
                    <View>
                        <FlatList
                            horizontal={true}
                            contentContainerStyle={tw`flex items-center`}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={groupUserStartPoints}
                            keyExtractor={(item) => item.userId}
                            renderItem={({ item }) => (
                                <View style={tw`mr-3 flex items-center`}>
                                    {
                                        <View style={tw`items-center justify-center rounded-full w-12 h-12 mb-1 bg-black`}>
                                            <View style={tw`items-center justify-center rounded-full w-8 h-8 bg-black shadow-lg`}>
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
                                        </View>
                                    }
                                    {
                                        item.name !== undefined &&
                                        <Text style={tw`uppercase text-center`}>{item.name.slice(0, 4)}</Text>
                                    }

                                </View>
                            )}
                        />
                    </View>
                    <View style={tw`flex-row justify-between items-center`}>
                        <View style={tw`w-2/3`}>
                            <Text style={tw`text-lg font-semibold`}>Currently Navigating To: {locationAddress}</Text>
                        </View>
                        <View style={tw``}>
                            {
                                !isLoading ?
                                    <TouchableOpacity style={tw`bg-yellow-400 rounded-2xl h-16 w-24 items-center flex justify-center shadow-lg`} onPress={() => {
                                        goBack()
                                    }}>
                                        <Text style={tw`text-2xl text-black`}>Quit</Text>
                                    </TouchableOpacity>
                                    :
                                    <View style={tw`bg-yellow-400 rounded-2xl h-16 w-24 justify-center items-center shadow-lg`}>
                                        <ActivityIndicator animating={isLoading} color="#000" />
                                    </View>
                            }

                        </View>
                    </View>
                </View>

            </View>
        </View>

    )
}

export default Navigation

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
    }
})