import React, { useEffect, useRef, useState } from 'react'
import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import MapView from 'react-native-maps';
import tw from 'tailwind-react-native-classnames'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

const Home = () => {

    const [lng, setLng] = useState(0);
    const [lat, setLat] = useState(0);

    const mapRef = useRef()

    const [errorMessage, setErrorMessage] = useState("")

    const [initialRegion, setInitialRegion] = useState({
        latitude: 30,
        longitude: -122,
        longitudeDelta: 5,
        latitudeDelta: 5
    })

    // useEffect(() => {
    //     async function func() {
    //         if (!checkPermission()) {
    //         } else {
    //             var coords = await getUserLocation()
    //             setLat(coords.latitude)
    //             setLng(coords.longitude)
    //             setInitialRegion({
    //                 latitude: coords.latitude,
    //                 longitude: coords.longitude,
    //                 longitudeDelta: 0.0421,
    //                 latitudeDelta: 0.0922
    //             })
    //         }
    //     }
    //     func()

    // }, [])

    useEffect(() => {
        // (async () => {
        //     let { status } = await Location.requestForegroundPermissionsAsync();
        //     if (status !== 'granted') {
        //         setErrorMsg('Permission to access location was denied');
        //         return;
        //     }

        //     let location = await Location.getCurrentPositionAsync({});
        //     //   setLocation(location);
        //     console.log(location);
        //     setLng(location.coords.longitude)
        //     setLat(location.coords.latitude)
        //     var latIn = location.coords.latitude
        //     var lngIn = location.coords.longitude
        //     setInitialRegion({
        //         latitude: location.coords.latitude,
        //         longitude: location.coords.longitude,
        //         longitudeDelta: 1,
        //         latitudeDelta: 1
        //     })
        //     mapRef.current.animateToRegion({
        //         latIn,
        //         lngIn,
        //         latitudeDelta: 1,
        //         longitudeDelta: 1
        //     })
        // })();
    }, []);

    const checkPermission = async () => {
        const hasPermission = await Location.requestBackgroundPermissionsAsync();
        if (hasPermission.status !== 'granted') {
            const permission = await askPermission();
            return permission;
        }
        return false;
    };
    const askPermission = async () => {
        const permission = await Location.getBackgroundPermissionsAsync();
        return permission.status === 'granted';
    };

    const getUserLocation = async () => {
        console.log('WE GOT HERERE')
        const userLocation = await Location.getCurrentPositionAsync();
        console.log(userLocation.coords)
        return userLocation.coords;
    }

    return (
        <View style={tw`relative flex-1 justify-between bg-black`}>
            <MapView
                style={StyleSheet.absoluteFillObject}
                provider={MapView.PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                ref={mapRef}
            >

            </MapView>
            <View></View>
            <View style={tw``}>
                {/* <Text>{lat}</Text>
                <Text>{lng}</Text> */}
                <View style={tw`bg-white h-80`}>
                    <View style={tw`flex justify-center bg-blue-400`}>
                        <View style={tw`w-20 h-1 rounded-full bg-gray-400`}></View>

                    </View>

                </View>
            </View>

        </View>
    )
}

export default Home
