import React, { useEffect, useRef, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import Map from '../../components/Map'
import tw from 'tailwind-react-native-classnames'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { auth, db } from '../../config/firebaseConfig'
import { StyleSheet } from 'react-native'

const Navigation = ({ navigation, route }) => {

    const mapRef = useRef()

    const [groupUserStartPoints, setGroupUserStartPoints] = useState(null)
    const [goingToCoords, setGoingToCoords] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [locationAddress, setLocationAddress] = useState("")

    const [inNavigation, setInNavigation] = useState(true)

    const locationUnsubscribe = useRef()
    const coordsUnsubscribe = useRef()

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
            let tempArr = []
            groupUserStartPoints.forEach((coords) => {
                tempArr.push(coords)
            })
            tempArr.push(goingToTemp)
            mapRef.current.fitToCoordinates(tempArr, {
                edgePadding: {
                    bottom: 200,
                    right: 50,
                    top: 100,
                    left: 50,
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
        } else {
            if (locationUnsubscribe.current != undefined) {
                locationUnsubscribe.current()
            }
            if (coordsUnsubscribe.current != undefined) {
                coordsUnsubscribe.current()
            }
        }
    }, [inNavigation])

    const getLocation = () => {
        locationUnsubscribe.current = db.collection("groups").doc(route.params.groupId).onSnapshot(snapshot => {
            console.log("LOCATION UNSUB")
            setLocationAddress(snapshot.data().locationAddress)
            if (snapshot.data().goingTolatitude !== undefined) {
                if (snapshot.data().goingTolatitude != "") {
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
        coordsUnsubscribe.current = db.collection("accepted").where("groupId", "==", route.params.groupId).onSnapshot(snapshot => {
            console.log("GROUP UNSUB")
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

    const goBack = async () => {
        setIsLoading(true)
        if (locationUnsubscribe.current != undefined) {
            locationUnsubscribe.current()
        }
        if (coordsUnsubscribe.current != undefined) {
            coordsUnsubscribe.current()
        }

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
                                    style={tw`flex-1`}
                                    coordinate={coordIn}
                                />
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
                        groupUserStartPoints.map((coords) => {
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
                        <Text style={tw`text-center text-2xl font-bold mb-1`}>BBQ</Text>
                    </View>
                    <View style={tw`flex-row justify-between items-center`}>
                        <View style={tw`w-2/3`}>
                            <Text style={tw`text-lg font-semibold`}>Currently Navigating To: {locationAddress}</Text>
                        </View>
                        <View style={tw``}>
                            {
                                !isLoading ?
                                    <TouchableOpacity style={tw`bg-yellow-400 rounded-2xl h-16 w-24 items-center flex justify-center`} onPress={() => {
                                        goBack()
                                    }}>
                                        <Text style={tw`text-2xl text-white`}>Quit</Text>
                                    </TouchableOpacity>
                                    :
                                    <View style={tw`bg-yellow-400 rounded-2xl h-16 w-24 justify-center items-center`}>
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
    tint: {
        backgroundColor: 'rgba(52, 52, 52, 0.8)'
    }
})