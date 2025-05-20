import { StyleSheet } from 'react-native';
import CustomScrollView from '@/components/CustomScrollView';
import FriendsCard from '@/components/FriendsCard';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, doc, documentId, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/constants/firebaseconfig';
import { User } from '../../../src/interfaces';


export default function TabTwoScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [friendUids, setFriendUids] = useState<String[]>([]);
  const { user } = useAuth();


  const [searchQuery, setSearchQuery] = useState('');
  // const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchAllUsersData = async () => {
      console.log("getting all users data")
      const usersCollectionRef = collection(db, "users")
      getDocs(usersCollectionRef)
        .then((snapshot) => {
          if (snapshot.empty) {
            console.log("No matching documents.")
            return
          }
          console.log("All users data fetched successfully.")
          const usersData: User[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            console.log(data)
            return {
              id: doc.id,
              uid: doc.id, // Use document ID as UID
              displayName: data.displayName || "Unknown",
              email: data.email || "", // Provide a default value for email
              photoURL: data.photoURL || "",
              watchlists: data.watchlists || [],
              friends: data.friends || [], // Provide a default value for friends
              friendCount: data.friends?.length || 0,
              lastActive: data.lastActive || "Unknown",
            }
          })
          setUsers(usersData)
          console.log("Fetched users:", usersData)
        })
        .catch((error) => console.error("Error fetching users:", error))
    }


    fetchAllUsersData()
  }, [])
  return (
    <CustomScrollView>
      <FriendsCard filteredFriends={users} />
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
