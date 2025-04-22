import { useEffect, useState } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  Image,
} from "react-native"
import Animated from "react-native-reanimated"

import CustomScrollView from "@/components/CustomScrollView"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import UserAvatar from "@/components/ui/UserAvatar"
import { LinearGradient } from "expo-linear-gradient"
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, documentId } from "firebase/firestore"
import { db } from "@/constants/firebaseconfig"
import { useAuth } from "@/context/AuthContext"




interface Watchlist {
  id: string
  title: string
  titles: number | string[]
  description: string
}

interface Watchlists {
  mine: Watchlist[]
  friends: Watchlist[]
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"mine" | "friends">("mine")
  const [myWatchlists, setMyWatchlists] = useState<Watchlist[]>([])
  const [friendsWatchlists, setFriendsWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    // Reference to the user document
    const userWatchslistRef = doc(db, "users", user.uid, "private", "watchlists");
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then((doc) => {
      const friends = doc.data()?.friends || [];
      const friendsWatchlistsIds: string[] = friends.map((friend: { watchlists: string[] }) => friend.watchlists).flat();

      const friendsWatchlistsRef = collection(db, "watchlists");
      if (friendsWatchlists.length > 0) {
        const q = query(friendsWatchlistsRef, where(documentId(), 'in', friendsWatchlistsIds));

        getDocs(q).then((snapshot) => {
          const friendsWatchlistsData: Watchlist[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "Untitled",
              titles: data.titles.split(',') || [],
              description: data.description || "",
              createdAt: data.createdAt,
              createdBy: data.createdBy
            };
          });
          setFriendsWatchlists(friendsWatchlistsData);
        }
        ).catch((error) => {
          console.error("Error getting friends watchlists:", error);
        }
        ).finally(() => {
          setLoading(false);
        }
        );
      }
    }).catch((error) => {
      console.error("Error getting friends watchlists:", error);
    });

    const unsubscribeUser = onSnapshot(userWatchslistRef, (useWacthlistDoc) => {
      if (!useWacthlistDoc.exists()) {
        setMyWatchlists([]);
        setLoading(false);
        return;
      }

      const userData = useWacthlistDoc.data();

      let userWatchlistIds: string[] = [];

      if (Array.isArray(userData?.watchlists)) {
        userWatchlistIds = userData.watchlists;
      }
      else if (typeof userData?.watchlists === 'object' && userData?.watchlists !== null) {
        userWatchlistIds = Object.keys(userData.watchlists);
      }

      console.log("Extracted watchlist IDs:", userWatchlistIds);

      // If we don't have any watchlist IDs, return early
      if (userWatchlistIds.length === 0) {
        setMyWatchlists([]);
        setLoading(false);
        return;
      }

      // Create a Set of IDs for quick lookup
      const watchlistIdSet = new Set(userWatchlistIds);

      // Monitor the watchlists collection, filtering by the user's watchlist IDs
      const watchlistsCollectionRef = collection(db, "watchlists");
      const q = query(watchlistsCollectionRef, where(documentId(), 'in', userWatchlistIds));

      const unsubscribeWatchlists = onSnapshot(q, (snapshot) => {
        const watchlistsData: Watchlist[] = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Watchlist data:", data);
          return {
            id: doc.id,
            title: data.title || "Untitled",  // Provide defaults in case fields are missing
            titles: data.titles.split(',') || [],
            description: data.description || "",
          };
        });
        setMyWatchlists(watchlistsData);
        setLoading(false);
      }, (error) => {
        console.error("Error monitoring watchlists collection:", error);
        setLoading(false);
      });
      return () => unsubscribeWatchlists();
    }, (error) => {
      console.error("Error getting user document:", error);
      setLoading(false);
    });

    return () => unsubscribeUser();
  }, [user?.uid]);

  return (
    <>
      <View style={styles.Header}>
        <UserAvatar />
        <View style={styles.tabContainer}>
          {["mine", "friends"].map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab as "mine" | "friends")}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === "mine" ? "Mine" : "Friends"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <CustomScrollView>
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading watchlists...</ThemedText>
        ) : activeTab === "mine" ? (
          myWatchlists.length > 0 ? (
            myWatchlists.map((item, index) => (
              <WatchListCard
                key={item.id || index}
                id={item.id}
                title={item.title}
                titles={Array.isArray(item.titles) ? item.titles.length : item.titles}
                description={item.description}
              />
            ))
          ) : (
            <ThemedText style={styles.emptyText}>No watchlists found. Create your first one!</ThemedText>
          )
        ) : (
          friendsWatchlists.map((item, index) => (
            <WatchListCard
              key={item.id || index}

              id={item.id}
              title={item.title}
              titles={Array.isArray(item.titles) ? item.titles.length : item.titles}
              description={item.description}
            />
          ))
        )}
      </CustomScrollView>
    </>
  )
}

const WatchListCard = (
  { id, title, titles, description, createdAt, createdBy }: { id: string; title: string; titles: number; description: string; createdAt?: string; createdBy?: string; } = {
    id: "",
    title: "",
    titles: 0,
    description: "",
    createdAt: "",
    createdBy: "",
  },
  onPress?: () => void,
) => {
  return (
    <ThemedView style={styles.watchlistCard} key={id} >
      <Image src="https://github.com/shadcn.png" style={styles.watchtlistPic} />
      <View style={styles.cardContent}>
        <ThemedText style={styles.card_title} type="subtitle">{title}</ThemedText>
        <Image src={createdBy} style={styles.createdByPic} />
        <ThemedText style={styles.card_description} type="default" numberOfLines={2}>{description}</ThemedText>
        <ThemedText style={styles.card_number} type="default">{titles} shows</ThemedText>
      </View>
    </ThemedView >
  )
}

const styles = StyleSheet.create({
  createdByPic: {
    width: 24,
    height: 24,
    borderRadius: 50,
  },
  Header: {
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    // backgroundColor: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
    zIndex: 1,
    elevation: 1,
  },
  tabButton: {
    paddingVertical: 8,
    // paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#222",
    width: "48%",
    alignItems: "center",
  },
  activeTabButton: {
    // backgroundColor: "#D8F000",
    borderColor: "#d8f000",
    borderWidth: 1,
    // color: "#fff"
  },
  tabText: {
    fontSize: 14,
    color: "#fff",
  },
  activeTabText: {
    color: "#d8f000",
    fontWeight: "bold",
  },
  watchlistCard: {
    backgroundColor: `rgb(32, 32, 32)`,
    borderColor: `rgb(50, 50, 50)`,
    borderWidth: 1,
    padding: 16,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
  },
  watchtlistPic: {
    width: 100,
    height: 100,
    borderRadius: 10
  },
  cardContent: {
    flex: 1,
    gap: 8,
  },
  card_title: {
    fontSize: 16
  },
  card_description: {
    fontSize: 14,
  },
  card_number: {
    fontSize: 12
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16
  }
})