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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import car from "../../assets/cars/car.png"

const Navigation = ({ navigation, route }) => {

    const mapRef = useRef()

    const [groupUserStartPoints, setGroupUserStartPoints] = useState(null)
    const [goingToCoords, setGoingToCoords] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [locationAddress, setLocationAddress] = useState("")
    const [initalPoints, setInitialPoints] = useState([])
    // const [data, setData] = useState([])

    const [inNavigation, setInNavigation] = useState(true)

    const locationUnsubscribe = useRef()
    const coordsUnsubscribe = useRef()
    const timeoutId = useRef()
    const setInitial = useRef(false)
    // const groupUnsubscribe = useRef()

    useEffect(() => {
        console.log("WORKS HERE")
        setLocationAddress(route.params.locationAddress)
        setGroupUserStartPoints(route.params.groupUserStartPoints)
        setGoingToCoords(route.params.goingToCoords)
    }, [])

    useEffect(() => {
        console.log("GROUPUSERSTARTPOINTS")
        if (groupUserStartPoints != null) {
            let goingToTemp = goingToCoords
            console.log("GOING TO TEMP")
            console.log(goingToTemp)
            let tempArr = []
            groupUserStartPoints.forEach((coords) => {
                tempArr.push(coords)
            })
            tempArr.push(goingToTemp)
            mapRef.current.fitToCoordinates(tempArr, {
                edgePadding: {
                    bottom: 270,
                    right: 75,
                    top: 50,
                    left: 75,
                },
                animated: true,
            });
        }
    }, [groupUserStartPoints])

    useEffect(() => {
        console.log("INNAVIGATION")
        if (inNavigation) {
            getLocation()
            getGroupStartCoords()
            updateInformation()
        } else {
            unsubscribeAll()
        }
    }, [inNavigation])

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

        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins="${location.coords.latitude},${location.coords.longitude}"&destinations=place_id:ChIJqVJ3OCm0D4gRc9S7toT7_IY&units=imperial&key=AIzaSyAnUyonRDhy7merKqpA6OKPmZkL7lu6dak`)
            .then(async (response) => {
                console.log('getting data from axios', await response.data.rows[0].elements[0].distance);
                if (await response.data) {
                    console.log("NOW HERE ACTUALLY")
                    await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        eta: await response.data.rows[0].elements[0].duration.text,
                        distance: await response.data.rows[0].elements[0].distance.text
                    }, {
                        merge: true
                    })
                }

            })
            .catch(error => {
                console.log(error);
            });
        timeoutId.current = setTimeout(() => { updateInformation() }, 5000)
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
                } else {
                    setGoingToCoords(null)
                    setInNavigation(false)
                }
            } else {
                setGoingToCoords(null)
                setInNavigation(false)
            }
        })
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
                        //TODO: ADD COLOR
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

    const goBack = async () => {
        setIsLoading(true)
        unsubscribeAll()

        if (route.params.groupOwner) {
            setIsLoading(true)
            await groupUserStartPoints.forEach((marker) => {
                db.collection("accepted").doc(marker.userId + "-" + route.params.groupId).set({
                    ready: false
                }, {
                    merge: true
                })
            })
            await db.collection("groups").doc(route.params.groupId).set({
                goingTolatitude: "",
                goingTolongitude: "",
                inNavigation: false,
                locationAddress: ""
            }, {
                merge: true
            })
        } else {
            await db.collection("accepted").doc(auth.currentUser.uid + "-" + route.params.groupId).set({
                ready: false
            }, {
                merge: true
            })
        }
        setTimeout(() => {
            setIsLoading(false)
            console.log(route.params.userCoords)
            navigation.navigate("readyToGo", {
                groupId: route.params.groupId,
                groupOwner: route.params.groupOwner,
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
                                    key={marker.userId}
                                    coordinate={coordIn}
                                >
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
                <View style={tw`bg-white pb-8 pt-6 pl-8 pr-8 rounded-t-3xl`}>
                    <View>
                        <FlatList
                            horizontal={true}
                            contentContainerStyle={tw`flex items-center`}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={groupUserStartPoints}
                            keyExtractor={(item) => item.userId}
                            renderItem={({ item }) => (
                                <View style={tw`m-3 flex items-center`}>
                                    {
                                        <View style={tw`items-center justify-center rounded-full w-12 h-12 mb-1 bg-black`}>
                                            <View style={tw`items-center justify-center rounded-full w-8 h-8 bg-black`}>
                                                <Image source={car} resizeMode='contain' style={styles.image} />
                                            </View>
                                        </View>
                                    }
                                    <Text style={tw`uppercase text-center`}>Saks</Text>
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
                                    <TouchableOpacity style={tw`bg-black rounded-2xl h-16 w-24 items-center flex justify-center`} onPress={() => {
                                        goBack()
                                    }}>
                                        <Text style={tw`text-2xl text-white`}>Quit</Text>
                                    </TouchableOpacity>
                                    :
                                    <View style={tw`bg-black rounded-2xl h-16 w-24 justify-center items-center`}>
                                        <ActivityIndicator animating={isLoading} color="#fff" />
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