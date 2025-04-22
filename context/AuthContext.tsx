import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db } from '@/constants/firebaseconfig'; // Ensure this uses initializeAuth with persistence
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

interface AuthUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure Google Sign-In (Needs to be done once)
// Use the Web Client ID from your Firebase project settings -> Authentication -> Sign-in method -> Google
GoogleSignin.configure({
    webClientId: '571116353159-gublhnhousrsaqjr25kg2ppem3r679n8.apps.googleusercontent.com',
});



export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check for existing Firebase session on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log("Firebase user detected:", firebaseUser.uid);
                const userData: AuthUser = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL
                };
                setUser(userData);
                const userDocRef = doc(db, "users", userData.uid)

                getDoc(userDocRef).then((doc) => {
                    if (doc.exists()) {
                        console.log("User document data:", doc.data());
                    }
                    else {
                        setDoc(userDocRef,
                            userData,
                        )
                        console.log("User document created:", userData);
                    }
                }
                ).catch((error) => {
                    console.error("Error getting user document:", error);
                });
                // Storing in AsyncStorage might be redundant if relying solely on onAuthStateChanged,
                // but can be useful for quick initial checks or offline access.
                await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
            } else {
                console.log("No Firebase user.");
                setUser(null);
                await AsyncStorage.removeItem('@user_data');
            }
            setIsLoading(false);
        });

        // Cleanup subscription
        return unsubscribe;
    }, []);

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
        <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, logout }}>
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