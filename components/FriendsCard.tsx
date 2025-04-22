import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from './ThemedText'
import { Feather } from '@expo/vector-icons'

interface Friend {
    id: string
    name: string
    profilePic: string
    watchlists: string[]
    friendCount: number
    lastActive?: string
}

type FriendsCardProps = {
    filteredFriends: Friend[]
}



const FriendsCard = ({ filteredFriends }: FriendsCardProps) => {
    const [expandedFriend, setExpandedFriend] = React.useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedFriend(expandedFriend === id ? null : id)
    }

    return (
        <>
            {filteredFriends.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
                    <View style={[styles.friendCard, expandedFriend === item.id && styles.expandedCard]}>
                        <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
                        <View style={styles.friendDetails}>
                            <ThemedText style={styles.friendName}>{item.name}</ThemedText>
                            <ThemedText style={styles.friendStatus}>{item.lastActive}</ThemedText>
                            <ThemedText style={styles.friendWatchlists}>
                                {item.watchlists.join(", ")}
                            </ThemedText>
                        </View>
                        <TouchableOpacity style={styles.moreButton} onPress={() => toggleExpand(item.id)}>
                            <Feather name={expandedFriend === item.id ? "chevron-up" : "chevron-down"} size={20} color="#444" />
                        </TouchableOpacity>
                    </View>

                    {expandedFriend === item.id && (
                        <View style={styles.expandedOptions}>
                            <TouchableOpacity style={styles.optionButton}>
                                <ThemedText style={styles.optionText}>Add to Watchlist</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionButton}>
                                <ThemedText style={styles.optionText}>Start New Watchlist</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            ))}</>
    )
}


const styles = StyleSheet.create({
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