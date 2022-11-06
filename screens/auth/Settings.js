import React, { useEffect, useRef, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native'
import tw from 'tailwind-react-native-classnames'
import { auth, db } from '../../config/firebaseConfig'
import { FontAwesome5 } from '@expo/vector-icons';
import groupcar from "../../assets/cars/groupcar.png"
import { Alert } from 'react-native';
import useAppleAuthentication from '../../hooks/useAppleAuth';
import * as Google from 'expo-auth-session/providers/google';
import * as Web from "expo-web-browser"
import firebase from "firebase"

Web.maybeCompleteAuthSession();

const Settings = ({ navigation }) => {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [appleAuthAvailable, authWithApple] = useAppleAuthentication();
    const [data, setData] = useState([])
    const groupsUnsubscribe = useRef()

    const [request, response, googleAuth] = Google.useIdTokenAuthRequest(
        {
            iosClientId: "1055584929031-rc0dq5304qqlpeed6tpsrvppsnh7db7n.apps.googleusercontent.com",
            expoClientId: "1055584929031-817cu9jj6ofqcs1c7amuc7f7i2pr931f.apps.googleusercontent.com"
        }
    );

    useEffect(() => {
        setName(auth.currentUser.displayName)
        setEmail(auth.currentUser.email)
        getGroupData()
    }, [auth.currentUser])

    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                const { id_token } = response.params;

                const provider = new firebase.auth.GoogleAuthProvider();
                const credential = provider.credential(id_token);
                firebase.auth().signInWithCredential(credential);
            }
        }
    }, [response]);

    const navigateBack = () => {
        console.log("WHA??")
        unsubscribe()
        navigation.navigate("home")
    }

    const unsubscribe = () => {
        if (groupsUnsubscribe.current != undefined) {
            console.log("UNSIBSCRIBING")
            groupsUnsubscribe.current()
        }
    }

    const leaveGroup = async (groupId) => {
        await db.collection("accepted").doc(auth.currentUser.uid + "-" + groupId).delete()
    }

    const getGroupData = () => {
        groupsUnsubscribe.current = db.collection("accepted").where("userId", "==", auth.currentUser.uid).onSnapshot(snapshot => {
            let tempArr = []
            snapshot.docs.forEach((doc) => {
                tempArr.push(doc.data())
            })
            setData(tempArr)
        })
    }

    const confirmDelete = async () => {
        try {
            console.log(groupsUnsubscribe.current)
            unsubscribe()
            console.log(groupsUnsubscribe.current)
            const provider = auth.currentUser.providerData[0].providerId
            if(provider == "apple.com"){
                const [credential, data] = await authWithApple();
                console.log(data)
                await auth.currentUser.reauthenticateWithCredential(credential)
            }else{
                await googleAuth()
                if (response) {
                    console.log(response)
                    if (response.type === 'success') {
                        console.log("WEFOUHWEFIUH")
                        const { id_token } = response.params;
                        const provider = new firebase.auth.GoogleAuthProvider();
                        const credential = provider.credential(id_token);
                        console.log(credential)
                        await auth.currentUser.reauthenticateWithCredential(credential);
                    }
                }
            }
            
            const acceptedDocs = db.collection('accepted').where('userId', '==', auth.currentUser.uid);
            acceptedDocs.get().then(async function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
                const userDoc = db.collection('users').doc(auth.currentUser.email).delete().then(() => {
                    // auth.currentUser.delete().then(() => {
                    //     setTimeout(() => {
                    //         navigation.navigate("auth")
                    //     }, 2000)
                    // })
                    auth.signOut().then(() => {
                        setTimeout(() => {
                            navigation.navigate("auth")
                        }, 2000)
                    })
                })
            });
        } catch (e) {
            console.log(e)
        }
    }

    const deleteAcount = async () => {
        try {
            Alert.alert(
                "WeGo",
                "Are you sure you want to delete your account?",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: "Confirm", onPress: () => {
                            confirmDelete()
                        }
                    }
                ])            // auth.currentUser.delete()
        } catch (e) {
            console.log(e)
        }
    }

    const logout = () => {
        unsubscribe()
        auth.signOut()
    }

    return (
        <SafeAreaView style={tw`mx-4 flex-1 ${Platform.OS === "android" && "mt-4"}`}>
            <View style={tw`flex-row items-center mb-6`}>
                <TouchableOpacity style={tw`mr-4`} onPress={() => {
                    navigateBack()
                }
                }>
                    <FontAwesome5 name='arrow-left' size={24} color="black" />
                </TouchableOpacity>
                <Text style={tw`text-3xl font-bold`}>Settings</Text>

            </View>
            <View style={tw`flex-row justify-between items-center mb-6`}>
                <View>
                    <Text style={tw`text-2xl font-semibold`}>{name}</Text>
                    <Text style={tw`text-lg font-semibold`}>{email}</Text>
                </View>
                <View style={tw``}>
                    <View style={tw`mb-2`}>
                        <TouchableOpacity style={tw` bg-yellow-400 flex justify-center items-center rounded-lg p-2`} onPress={async () => {
                            logout()
                            navigation.navigate("auth")
                        }}>
                            <Text style={tw`text-lg font-semibold`}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity style={tw` bg-yellow-400 flex justify-center items-center rounded-lg p-2`} onPress={() => {
                            deleteAcount()
                        }}>
                            <Text style={tw`text-lg font-semibold`}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <View style={tw`w-full h-px bg-yellow-400 mb-6`} />
            <View>
                <Text style={tw`text-xl font-semibold text-center`}>Groups</Text>
                {
                    data !== [] &&
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.groupId}
                        contentContainerStyle={tw`flex items-center w-full`}
                        numColumns={4}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={tw`py-3 px-3`}>
                                <View>
                                    <View style={tw`items-center justify-center rounded-full w-16 h-16 mb-1 bg-black shadow-lg`}>

                                        <View style={tw`items-center justify-center rounded-full w-10 h-10 bg-black`}>
                                            <Image
                                                source={groupcar}
                                                style={styles.image}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    </View>
                                    <Text style={tw`uppercase text-center mb-2`}>{item.groupName.slice(0, 5)}</Text>
                                    <TouchableOpacity style={tw`bg-yellow-400 p-2 rounded-lg`} onPress={() => {
                                        leaveGroup(item.groupId)
                                    }}>
                                        <Text style={tw`text-center`}>Leave</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        )}

                    />
                }

            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
    }
});


export default Settings
