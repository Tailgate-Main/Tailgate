import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './screens/auth/Signup';
import Login from './screens/auth/Login';
import Home from './screens/main/Home';
import ReadyToGo from './screens/main/ReadyToGo';
import Navigation from "./screens/main/Navigation"
import AddGroup from './screens/main/AddGroup';
import Requests from './screens/main/Requests';
import { StatusBar, Platform } from 'react-native';
import AddToGroup from './screens/main/AddToGroup';
import Settings from './screens/auth/Settings';

function SignupScreen({ navigation }) {
    return (
        <Signup navigation={navigation} />
    );
}

function LoginScreen({ navigation }) {
    return (
        <Login navigation={navigation} />
    );
}

function HomeScreen({ navigation }) {
    return (
        <Home navigation={navigation} />
    )
}

function ReadyToGoScreen({ navigation, route }) {
    return (
        <ReadyToGo navigation={navigation} route={route} />
    );
}

function NavigationScreen({ navigation, route }) {
    return (
        <Navigation navigation={navigation} route={route} />
    );
}

function AddGroupScreen({ navigation, route }) {
    return (
        <AddGroup navigation={navigation} route={route} />
    )
}

function RequestsScreen({ navigation }) {
    return (
        <Requests navigation={navigation} />
    )
}

function AddToGroupScreen({ navigation, route }){
    return (
        <AddToGroup navigation={navigation} route={route}/>
    )
}

function SettingsScreen({ navigation }){
    return <Settings navigation={navigation}/>
}

const Stack = createNativeStackNavigator();

export default function App() {

    useEffect(() => {
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor('#FF573300');
        }
    }, [])

    return (
        <NavigationContainer independent={true}>
            <StatusBar barStyle="dark-content" />
            <Stack.Navigator screenOptions={{
                headerShown: false
            }} initialRouteName="login">
                <Stack.Screen name="signup" component={SignupScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="login" component={LoginScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="home" component={HomeScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="readyToGo" component={ReadyToGoScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="navigation" component={NavigationScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="add" component={AddGroupScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="requests" component={RequestsScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="addTo" component={AddToGroupScreen} options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="settings" component={SettingsScreen} options={{ gestureEnabled: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

