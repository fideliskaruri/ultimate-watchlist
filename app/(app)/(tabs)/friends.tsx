import { useState, useCallback, useMemo, useEffect } from "react"
import {
    StyleSheet,
    TextInput,
    View,
    RefreshControl,
    ScrollView,
} from "react-native"
import { AntDesign } from "@expo/vector-icons"
import CustomScrollView from "@/components/CustomScrollView"
import FriendsCard from "@/components/FriendsCard"
import { collection, doc, documentId, getDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/constants/firebaseconfig"
import { useAuth } from "@/context/AuthContext"

// Type definition
interface Friend {
    id: string
    name: string
    profilePic: string
    watchlists: string[]
    friendCount: number
    lastActive?: string
}

export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendUids, setFriendUids] = useState<string[]>([])
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [refreshing, setRefreshing] = useState(false)

    const filteredFriends = useMemo(() => {
        if (!searchQuery.trim()) return friends
        return friends.filter(
            (friend) =>
                friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                friend.watchlists.some((list) => list.toLowerCase().includes(searchQuery.toLowerCase())),
        )
    }, [friends, searchQuery])

    const handleSearch = (query: string) => setSearchQuery(query)

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1500)
    }, [])


    useEffect(() => {
        const fetchFriends = async () => {
            if (!user?.uid) return
            const friendsRef = doc(db, "users", user.uid)
            getDoc(friendsRef)
                .then((doc) => {
                    const friends = doc.data()?.friends.map((friend: { uid: string }) => friend.uid).flat()
                    console.log(friends)
                    setFriendUids(friends)
                })
                .catch((error) => console.error("Error fetching friends:", error))

            const friendsCollectionRef = collection(db, "users")
            const q = query(friendsCollectionRef, where(documentId(), "in", friendUids))
            getDocs(q)
                .then((snapshot) => {
                    const friendsData: Friend[] = snapshot.docs.map((doc) => {
                        const data = doc.data()
                        console.log(data)
                        return {
                            id: doc.id,
                            name: data.displayName || "Unknown",
                            profilePic: data.photoURL || "",
                            watchlists: data.watchlists || [],
                            friendCount: data.friends?.length || 0,
                            lastActive: data.lastActive || "Unknown",
                        }
                    })
                    setFriends(friendsData)
                })
                .catch((error) => console.error("Error fetching friends:", error))
        }

        fetchFriends()
    }, [])

    return (
        <>
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <AntDesign name="search1" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search friends..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            <CustomScrollView
            >
                <FriendsCard filteredFriends={filteredFriends} />
            </CustomScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: "#000",
        paddingTop: 16,
        // height: "auto"
    },
    searchContainer: {
        // position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        width: "90%",
        alignSelf: "center",
        zIndex: 2,
        // marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    friendsContainer: {
        marginTop: -40,
        paddingBottom: 50,

    },
    friendCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    expandedCard: {
        backgroundColor: "#f0f0f0",
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    friendDetails: {
        flex: 1,
    },
    friendName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    friendStatus: {
        fontSize: 14,
        color: "#666",
    },
    friendWatchlists: {
        fontSize: 14,
        color: "#888",
    },
    moreButton: {
        padding: 10,
    },
    expandedOptions: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        marginTop: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    optionButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#ddd",
        marginBottom: 5,
        alignItems: "center",
    },
})
