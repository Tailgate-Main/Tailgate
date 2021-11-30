import React from 'react'
import {  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements/dist/icons/Icon'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'tailwind-react-native-classnames'
import {FontAwesome5 ,Entypo} from '@expo/vector-icons'; 
const Home = () => {
    return (
        <>
        
        <SafeAreaView style={[tw`bg-white h-full`]}>
            <Text style={tw`font-bold mx-6`}> Groups </Text>   
            <View style={tw`flex-row items-start`}>
             <View style={tw`mx-5`}>
             <TouchableOpacity style={tw`items-center justify-center rounded-full w-16 h-16 bg-yellow-400`}>
                  <Entypo name="plus" size={24} color="black"/>
              </TouchableOpacity>  
             </View>
            <View style={tw`mx-5`}> 
            <TouchableOpacity  style={tw`items-center justify-center rounded-full w-16 h-16 bg-blue-400`}>
                  <FontAwesome5  name="user-friends" size={24} color="black"/>     
              </TouchableOpacity>  
              <Text style={tw`uppercase text-center`}>bbq</Text>  
            </View>
            <View style={tw`mx-5`}>
            <TouchableOpacity style={tw`items-center justify-center  rounded-full w-16 h-16 bg-pink-300`}>
                  <FontAwesome5 name="user-friends" size={24} color="black"/>
              </TouchableOpacity>
              <Text style={tw`uppercase text-center`}>dine</Text>
            </View>
            </View>
        </SafeAreaView>
        </>
    )
}

export default Home

const styles = StyleSheet.create({

})
