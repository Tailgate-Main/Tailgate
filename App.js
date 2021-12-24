import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './screens/auth/Signup';
import Login from './screens/auth/Login';
import Home from './screens/main/Home';
import ReadyToGo from './screens/main/ReadyToGo';


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
  return(
    <Home navigation={navigation} />
  )
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        // headerShown: false
      }} initialRouteName="readyToGo">
        <Stack.Screen name="signup" component={SignupScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Screen name="readyToGo" component={ReadyToGo}
          
     />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

