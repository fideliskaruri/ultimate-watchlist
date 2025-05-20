/**
 * Watchlist interface - represents a user's watchlist
 */
export interface Watchlist {
    id: string;
    title: string;
    description: string;
    titles: string[]; // Array of show/movie titles
}

/**
 * Firestore query interface - defines the operation to perform on Firestore
 */
export interface FirestoreQuery {
    operation: 'set';  // Only using 'set' for all operations
    collection: string ; // Collection path
    docId?: string;    // Optional document ID (generated if not provided)
    data: any;
    visibility?: "private" | "public";       // Initial data structure for the document
}

/**
 * Action button interface - defines floating action button properties
 */
export interface ActionButtonProps {
    icon: string;      // Icon name
    label: string;     // Button label
    onPress: () => void; // Callback function
    iconType?: "AntDesign" | "MaterialIcons";
    backgroundColor?: string;
    query?: FirestoreQuery; // Query to execute when pressed
}

/**
 * Form modal props interface
 */
export interface FormModalProps {
    modalVisible: boolean;
    closeModal: () => void;
    activeQuery: FirestoreQuery | null;
}

/**
 * Props for the ExpandableFloatingButton component
 */
export interface ExpandableFloatingButtonProps {
    actions: ActionButtonProps[];
    mainButtonColor?: string;
}

/**
 * Category interface - represents a content category
 */
export interface Category {
    id: string;
    name: string;
    description: string;
}

/**
 * Room interface - represents a sharing room with other users
 */
export interface Room {
    id: string;
    name: string;
    description: string;
    members: string[]; // Array of user IDs
    createdBy: string; // User ID of room creator
    createdAt: string; // ISO timestamp
}

/**
 * User interface - represents a user profile
 */
export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    friends: {
        uid: string;
        watchlists: any[];
    }[]
}

/**
 * Auth context interface - represents the authentication context
 */
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
}