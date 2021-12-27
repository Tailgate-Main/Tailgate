import React from 'react'
import { View, Text } from 'react-native'
import Map from '../../components/Map'
import tw from 'tailwind-react-native-classnames'

const Navigation = ({ navigation, route }) => {
    return (
        <View style={tw`flex-1`}>
            <Map />
        </View>
    )
}

export default Navigation
