import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './screens/auth/Signup';
import Login from './screens/auth/Login';
import Home from './screens/main/Home';
import ReadyToGo from './screens/main/ReadyToGo';
import Navigation from "./screens/main/Navigation"
import AddGroup from './screens/main/AddGroup';


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

function NavigationScreen({ navigation }) {
  return (
    <Navigation navigation={navigation} />
  );
}

function AddGroupScreen({ navigation, route }){
  return (
    <AddGroup navigation={navigation} route={route}/>
  )
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{
        headerShown: false
      }} initialRouteName="login">
        <Stack.Screen name="signup" component={SignupScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Screen name="readyToGo" component={ReadyToGoScreen} />
        <Stack.Screen name="navigation" component={NavigationScreen} />
        <Stack.Screen name="addToGroup" component={AddGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

