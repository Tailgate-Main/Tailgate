import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Platform, StatusBar, Image } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5 } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { auth, db } from '../../config/firebaseConfig';
import { ActivityIndicator } from 'react-native';
import car from "../../assets/cars/greycar.png"
import Svg from 'react-native-svg';
import groupcar from "../../assets/cars/groupcar.png"

const Home = ({ navigation }) => {

    const [startCoords, setStartCoords] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const mapRef = useRef()
    const [loading, setLoading] = useState(true)
    const [mapCoords, setMapCoords] = useState(null)
    const [heading, setHeading] = useState(0)
    const [locationAllowed, setLocationAllowed] = useState(false)

    const [data, setData] = useState([{
        userId: 1,
        groupId: 1,
        groupName: 1
    }])

    const groupsUnsubscribe = useRef()

    useEffect(() => {
        (async () => {
            setLoading(true)
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationAllowed(false)
                setLoading(false)
                setErrorMsg('Permission to access location was denied');
                alert("WeGo needs location permissions to provide users with real time ETAs")
                return;
            }
            let location = await Location.getCurrentPositionAsync({
                maximumAge: Platform.OS === "android" && 60000, // only for Android
                accuracy: Platform.OS === "android" ? Location.Accuracy.Low : Location.Accuracy.Lowest,
            });
            let coords = {
                latitude: location.coords.latitude - 0.0005,
                longitude: location.coords.longitude
            }
            let other = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }
            // loadData()
            setLoading(false)
            setLocationAllowed(true)
            mapRef.current.animateCamera({ center: coords, pitch: 0, heading: 0, altitude: 0, zoom: 18 }, 1000)
            setMapCoords(coords)
            setStartCoords(other);
            setHeading(location.coords.heading)
            getGroupData()

        })();
    }, []);

    useEffect(() => {
        async function func() {
            getGroupData()
        }
        const unsubscribe = navigation.addListener('focus', () => {
            func()
        });
        return unsubscribe;
    }, [navigation]);

    const getGroupData = () => {
        groupsUnsubscribe.current = db.collection("accepted").where("userId", "==", auth.currentUser.uid).onSnapshot(snapshot => {
            let tempArr = []
            snapshot.docs.forEach((doc) => {
                tempArr.push(doc.data())
            })
            setData([{userId: 1, groupId: 1, groupName: 1}, ...tempArr])
        })
    }

    // const loadData = async () => {
    //     console.log(auth.currentUser.uid)
    //     const all = await db.collection("accepted").where("userId", "==", auth.currentUser.uid).get()
    //     all.docs.forEach((doc) => {
    //         setData(oldArray => [...oldArray, doc.data()]);
    //     })
    // }

    const navigateToRequests = () => {
        if (groupsUnsubscribe.current != undefined) {
            groupsUnsubscribe.current()
        }
        navigation.navigate("requests")
    }

    return (
        <View style={tw`flex-1`}>
            {
                loading ?
                    <View style={tw`w-full h-full`}>
                        <View style={tw`flex-1 content-center justify-center items-center`}>
                            <View style={styles.activityIndicatorWrapper}>
                                <ActivityIndicator color="#000" animating={loading} />
                            </View>
                        </View>
                    </View>
                    :
                    <View style={tw`flex-1`}>
                        {
                            locationAllowed ?
                                <View style={tw`flex-1`}>
                                    <View style={tw`flex-1 relative`}>
                                        <MapView
                                            ref={mapRef}
                                            style={tw`flex-1`}
                                            provider={PROVIDER_GOOGLE}
                                        >
                                            {
                                                startCoords &&
                                                <Marker
                                                    coordinate={startCoords}
                                                >
                                                    <Svg>
                                                        <Image
                                                            source={car}
                                                            style={{
                                                                height: 40, transform: [{
                                                                    rotate: `${heading}deg`
                                                                }]
                                                            }}
                                                            resizeMode='contain'
                                                        />
                                                    </Svg>
                                                </Marker>
                                            }

                                        </MapView>
                                    </View>
                                    <View style={tw`absolute w-full h-full flex justify-between flex-1`} pointerEvents='box-none'>
                                        <SafeAreaView style={tw`flex-row justify-between mx-4 ${Platform.OS === "android" && "mt-2"}`}>
                                            <View></View>
                                            <View style={tw`flex-row bg-yellow-400 rounded-full p-1 shadow-xl`}>
                                                <TouchableOpacity style={tw`px-2 py-1 mr-1 rounded-full`} onPress={() => { navigateToRequests() }}>
                                                    <FontAwesome5 name="bell" size={20} color="black" />
                                                </TouchableOpacity>
                                                <View style={tw`h-full w-px bg-black`} />
                                                <View style={tw`h-full w-px bg-black`} />
                                                <TouchableOpacity style={tw`px-2 py-1 ml-1 rounded-full`} onPress={() => { navigation.navigate("settings") }}>
                                                    <FontAwesome5 name="cog" size={20} color="black" />
                                                </TouchableOpacity>
                                            </View>

                                        </SafeAreaView>
                                        <View style={tw`h-2/5 rounded-t-3xl bg-white w-full shadow-md`}>
                                            <View style={tw`flex-1`}>
                                                <Text style={tw`font-semibold text-3xl mb-2 mt-4 text-center`}>Groups</Text>

                                                <FlatList
                                                    data={data}
                                                    keyExtractor={(item) => item.groupId}
                                                    contentContainerStyle={tw`flex items-center`}
                                                    numColumns={4}
                                                    showsVerticalScrollIndicator={false}
                                                    showsHorizontalScrollIndicator={false}
                                                    renderItem={({ item }) => (
                                                        <View style={tw`p-3`}>
                                                            {
                                                                item.groupId !== 1 ?
                                                                    <View>
                                                                        <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 bg-black shadow-lg`}>

                                                                            <TouchableOpacity style={tw`items-center justify-center rounded-full w-10 h-10 bg-black`} onPress={() => {
                                                                                if (groupsUnsubscribe.current != undefined) {
                                                                                    groupsUnsubscribe.current()
                                                                                }
                                                                                navigation.navigate("readyToGo", {
                                                                                    groupName: item.groupName,
                                                                                    groupId: item.groupId,
                                                                                    groupOwner: item.groupOwner === auth.currentUser.uid,
                                                                                    userCoords: startCoords,
                                                                                })
                                                                            }}>

                                                                                <Image
                                                                                    source={groupcar}
                                                                                    style={[styles.image]}
                                                                                    resizeMode="contain"
                                                                                />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                        <Text style={tw`uppercase text-center`}>{item.groupName.slice(0, 5)}</Text>
                                                                    </View>
                                                                    :
                                                                    <View>
                                                                        <TouchableOpacity style={tw`items-center justify-center rounded-full w-16 h-16 bg-yellow-400 shadow-lg`}
                                                                            onPress={() => {
                                                                                if (groupsUnsubscribe.current != undefined) {
                                                                                    groupsUnsubscribe.current()
                                                                                }
                                                                                navigation.navigate("add")
                                                                            }}>
                                                                            <FontAwesome5 name="plus" size={24} color="black" />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                            }

                                                        </View>

                                                    )}

                                                />


                                            </View>
                                        </View>
                                    </View>
                                </View>

                                :
                                <SafeAreaView>
                                    <View style={tw`p-2 flex h-full`}>
                                        <Text style={tw`text-2xl`}>Location was not allowed</Text>
                                        <Text style={tw`text-2xl`}>Waiting for location permissions</Text>
                                    </View>
                                </SafeAreaView>

                        }

                    </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    modalBackground: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityIndicatorWrapper: {
        backgroundColor: "#ffffff",
        height: 50,
        width: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    AndroidSafeArea: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
    }
});

export default Home