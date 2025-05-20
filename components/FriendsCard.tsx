import React from 'react'
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ThemedText } from './ThemedText'
import { Feather } from '@expo/vector-icons'
import { User } from '../src/interfaces'
import { useAuth } from '@/context/AuthContext'

interface Friend {
    id: string
    name: string
    profilePic: string
    watchlists: string[]
    friendCount: number
    lastActive?: string
}

type FriendsCardProps = {
    filteredFriends: User[]
}



const FriendsCard = ({ filteredFriends }: FriendsCardProps) => {
    const [expandedFriend, setExpandedFriend] = React.useState<string | null>(null)
    const { isFriend, user } = useAuth();
    const [friendStatus, setFriendStatus] = React.useState<boolean>(isFriend(user?.uid || ''));

    const toggleExpand = (id: string) => {
        setExpandedFriend(expandedFriend === id ? null : id)
    }

    return (
        <>
            {filteredFriends.map((item) => (
                <TouchableOpacity key={item.uid} onPress={() => toggleExpand(item.uid)} activeOpacity={0.8}>
                    <View style={[styles.friendCard, expandedFriend === item.uid && styles.expandedCard]}>
                        <Image source={{ uri: item.photoURL || 'https://via.placeholder.com/150' }} style={styles.profilePic} />
                        <View style={styles.friendDetails}>
                            <ThemedText style={styles.friendName}>{item.displayName}</ThemedText>
                        </View>
                        <TouchableOpacity style={styles.moreButton} onPress={() => toggleExpand(item.uid)}>
                            <Feather name={expandedFriend === item.uid ? "chevron-up" : "chevron-down"} size={20} color="#444" />
                        </TouchableOpacity>
                    </View>

                    {expandedFriend === item.uid && (
                        <View style={styles.expandedOptions}>
                            <TouchableOpacity style={styles.optionButton}>
                                <ThemedText style={styles.optionText}>Add to Watchlist</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionButton}>
                                <ThemedText style={styles.optionText}>Start New Watchlist</ThemedText>
                            </TouchableOpacity>
                            <View style={styles.buttonContainer}>
                                <Button
                                    title={isFriend(item.uid) ? "Following" : "Follow"}
                                    color={`#007bff`}
                                />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            ))}</>
    )
}
const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 5,
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    friendCard: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    expandedCard: {
        borderBottomWidth: 0,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    friendDetails: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    friendName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    friendStatus: {
        color: '#fff',
    },
    friendWatchlists: {
        color: '#fff',
    },
    moreButton: {
        justifyContent: 'center',
    },
    expandedOptions: {
        padding: 10,
        // flexDirection: 'row',
        gap: 12,
        // backgroundColor: '#',
        justifyContent: 'space-between',
        // width: "",

    },
    optionButton: {
        padding: 10,
        borderWidth: 1,
        // borderBottomColor: '#ddd',
        borderRadius: 5,
        alignItems: 'center',
        borderColor: "white"
    },
    optionText: {
        fontSize: 12,
    },
});

export default FriendsCard