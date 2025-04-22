import CustomScrollView from '@/components/CustomScrollView'
import { ThemedText } from '@/components/ThemedText'
import React from 'react'

const rooms = () => {
    return (
        <CustomScrollView>
            <ThemedText type="title">Rooms</ThemedText>
        </CustomScrollView>
    )
}

export default rooms