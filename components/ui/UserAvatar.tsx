import { StyleSheet, Text, View } from "react-native";
import { Image } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import CustomButton from "./CustomButton";
import { AntDesign } from "@expo/vector-icons";


export default function UserAvatar() {
    const { user, logout } = useAuth();
    const [expanded, setExpanded] = useState(false);

    const avatarContainerStyle = [
        styles.avatarContainer,
        { borderColor: expanded ? "#D8F000" : "#fff" },
    ];

    return user ? (

        <View style={avatarContainerStyle} onTouchEnd={() => setExpanded(!expanded)}>

            <Image src={
                user.photoURL ? user.photoURL : "https://github.com/shadcn.png"
            } style={styles.avatar}

            />


            {expanded &&
                (
                    <View style={styles.expandableContainer}>
                        <Text style={styles.initials}>{user.displayName}</Text>
                        <CustomButton style={styles.logoutButton} title="Logout" onPress={() => logout()} icon={
                            <AntDesign name="logout" size={16} color="#fff" />} />
                    </View>)
            }

        </View>
    ) : null;
}



const styles = StyleSheet.create({
    avatarContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#000",
        width: "auto",
        alignSelf: "flex-end",
        borderWidth: 2,
        borderRadius: 50,
        zIndex: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 50,

    },
    initials: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
    expandableContainer: {
        position: "absolute",
        top: 50,
        width: 200,
        right: 0,
        backgroundColor: `rgb(32, 32, 32)`,
        padding: 20,
        height: "auto",
        borderRadius: 10,
        borderColor: "#D8F000",
        borderWidth: 1,
        gap: 12,

    },
    logoutButton: {
        backgroundColor: "#FF5252",
    },
});