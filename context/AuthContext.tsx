import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db } from '@/constants/firebaseconfig';
import {
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithCredential,
    User as FirebaseUser
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '@/src/interfaces';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isFriend: (userId: string) => boolean; // New function to check friend status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '571116353159-gublhnhousrsaqjr25kg2ppem3r679n8.apps.googleusercontent.com',
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log("Firebase user detected:", firebaseUser.uid);

                const userDocRef = doc(db, "users", firebaseUser.uid);

                try {
                    // Get full user data including friends list
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        // Use the full document data including friends list
                        const userData = userDoc.data() as User;
                        setUser({
                            ...userData,
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName,
                            email: firebaseUser.email,
                            photoURL: firebaseUser.photoURL,
                            // Keep existing friends list or initialize as empty array
                            friends: userData.friends || []
                        });
                    } else {
                        // Create new user document
                        const newUserData: User = {
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName,
                            email: firebaseUser.email,
                            photoURL: firebaseUser.photoURL,
                            friends: [] // Initialize empty friends array
                        };

                        await setDoc(userDocRef, newUserData);
                        setUser(newUserData);
                    }

                    await AsyncStorage.setItem('@user_data', JSON.stringify(user));
                } catch (error) {
                    console.error("Error handling user document:", error);
                    Alert.alert('Error', 'Failed to load user data');
                }
            } else {
                console.log("No Firebase user.");
                setUser(null);
                await AsyncStorage.removeItem('@user_data');
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    // Function to check if a user ID is in the current user's friends list
    const isFriend = (userId: string): boolean => {
        if (!user || !user.friends) return false;

        // Check if the user ID exists in the friends array
        return user.friends.some(friend => friend.uid === userId);
    };

    const signInWithGoogle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            // Check if device has Google Play Services installed & up-to-date
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the user's ID token
            await GoogleSignin.signIn();
            const { idToken } = await GoogleSignin.getTokens();
            console.log("Google Sign-In Success, ID Token obtained.");

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            console.log("Signing in to Firebase with Google credential...");
            await signInWithCredential(auth, googleCredential);
            console.log("Firebase sign-in successful.");
            // onAuthStateChanged will handle setting the user state and AsyncStorage

        } catch (error: any) {
            console.error('Google sign-in error:', JSON.stringify(error, null, 2));
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
                Alert.alert('In Progress', 'Sign in is already in progress.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                Alert.alert('Play Services Error', 'Google Play Services not available or outdated.');
            } else {
                // some other error happened
                Alert.alert('Authentication Error', `An error occurred: ${error.message}`);
            }
        } finally {
            // Set loading to false *after* onAuthStateChanged has likely run
            setTimeout(() => setIsLoading(false), 500); // Small delay to allow state update
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Sign out from Firebase
            await signOut(auth);
            console.log("Firebase sign out successful.");

            // Sign out from Google Signin (optional but recommended)
            try {
                await GoogleSignin.revokeAccess(); // Revoke access
                await GoogleSignin.signOut();     // Sign out locally
                console.log("Google Signin sign out successful.");
            } catch (error) {
                console.error("Error signing out of Google:", error);
            }
            // onAuthStateChanged will handle setting user to null and clearing AsyncStorage
        } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Logout Error', 'Failed to sign out completely.');
        }
        // No need to manually set user/clear storage here, onAuthStateChanged handles it
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            signInWithGoogle,
            logout,
            isFriend // Add the new function to the context
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};