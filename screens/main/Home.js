import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Platform, StatusBar } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { FontAwesome5 } from '@expo/vector-icons';
import Map from '../../components/Map';
import { FlatList } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { auth, db } from '../../config/firebaseConfig';
import { ActivityIndicator, Modal } from 'react-native';

const Home = ({ navigation }) => {

    const [startCoords, setStartCoords] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const mapRef = useRef()
    const [loading, setLoading] = useState(true)
    const [mapCoords, setMapCoords] = useState(null)

    let groupsUnsubscribe = null

    useEffect(() => {
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor('#FF573300');
        }
        (async () => {
            setLoading(true)
            console.log("GOT HERE")
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log("NOW HERE")
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            console.log("NOW HERE TOO")
            let location = await Location.getCurrentPositionAsync();
            console.log("GOT THE LOCATION")
            console.log(location)
            let coords = {
                latitude: location.coords.latitude - 0.0005,
                longitude: location.coords.longitude + 0.0004
            }
            let other = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }
            // loadData()
            setLoading(false)
            mapRef.current.animateCamera({ center: coords, pitch: 0, heading: 0, altitude: 0, zoom: 18 }, 1000)
            setMapCoords(coords)
            setStartCoords(other);

            groupsUnsubscribe = db.collection("accepted").where("userId", "==", auth.currentUser.uid).onSnapshot(snapshot => {
                let tempArr = [{
                    userId: 1,
                    groupId: 1,
                    groupName: 1
                }]
                snapshot.docs.forEach((doc) => {
                    tempArr.push(doc.data())
                })
                setData(tempArr)
            })

        })();
    }, []);

    const [data, setData] = useState([{
        userId: 1,
        groupId: 1,
        groupName: 1
    }])

    // const loadData = async () => {
    //     console.log(auth.currentUser.uid)
    //     const all = await db.collection("accepted").where("userId", "==", auth.currentUser.uid).get()
    //     all.docs.forEach((doc) => {
    //         setData(oldArray => [...oldArray, doc.data()]);
    //     })
    // }

    const navigateToRequests = () => {
        if(groupsUnsubscribe != null){
            groupsUnsubscribe()
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
                                    />
                                }

                            </MapView>
                        </View>
                        <View style={tw`absolute w-full h-full flex justify-between flex-1`} pointerEvents='box-none'>
                            <SafeAreaView style={tw`flex-row justify-between mx-4 ${Platform.OS === "android" && "mt-2"}`}>
                                <View></View>
                                <TouchableOpacity style={tw`bg-yellow-400 p-2 rounded-full`} onPress={() => { navigateToRequests() }}>
                                    <FontAwesome5 name="bell" size={24} color="black" />
                                </TouchableOpacity>
                            </SafeAreaView>
                            <View style={tw`h-2/5 rounded-t-3xl bg-white w-full`}>
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
                                                        <View style={tw`flex items-center`}>
                                                            <TouchableOpacity style={tw`items-center justify-center rounded-full w-16 h-16 bg-red-400 mb-1`}
                                                                onPress={() => {
                                                                    if(groupsUnsubscribe != null){
                                                                        groupsUnsubscribe()
                                                                    }
                                                                    navigation.navigate("readyToGo", {
                                                                        groupName: item.groupName,
                                                                        groupId: item.groupId,
                                                                        groupOwner: item.groupOwner === auth.currentUser.uid,
                                                                        userCoords: startCoords,
                                                                    })
                                                                }}>
                                                                <FontAwesome5 name="user-friends" size={24} color="black" />
                                                            </TouchableOpacity>
                                                            <Text style={tw`uppercase text-center`}>{item.groupName.slice(0, 5)}</Text>
                                                        </View>
                                                        :
                                                        <View>
                                                            <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 bg-yellow-400`}
                                                                onPress={() => {
                                                                    if(groupsUnsubscribe != null){
                                                                        groupsUnsubscribe()
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
    }
});

export default Home