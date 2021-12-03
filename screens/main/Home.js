import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'tailwind-react-native-classnames'
import {FontAwesome5 ,Entypo} from '@expo/vector-icons'; 
import Map from '../../components/Map';
import Item from 'antd/lib/list/Item';
const Home = () => {
    return (
        <>
        <View>
           <View style={tw`h-1/2`}>
               <Map/>
           </View> 
           <View style={tw`h-1/2 rounded-full`}>
           <SafeAreaView style={[tw`bg-white h-full `]}>

            
                <View style={tw`flex mx-auto w-20 rounded-full`}>
                        <View style={tw` h-2 rounded-full bg-gray-400`}></View>

                    </View>
       
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

           </View>
        </View>
     
     
        </>
    )
}
export default Home

const styles = StyleSheet.create({
   
    horizantalline:{
        width:30,
        height:5,
        backgroundColor:'gray',
        flex:0,
        alignItems: 'center',
        
    },
   
}) 