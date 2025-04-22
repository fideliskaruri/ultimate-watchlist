import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    return (
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key]
                    const isFocused = state.index === index

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        })
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name)
                        }
                    }

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        })
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tab}
                        >
                            {/* Apply selected color */}
                            {options.tabBarIcon?.({ focused: isFocused, color: isFocused ? "#D8F000" : "#fff", size: 24 })}
                            <Text style={{ color: isFocused ? "#D8F000" : "#fff", fontSize: 12 }}>
                                {options.title}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        flexDirection: "row",
        // backgroundColor: "#000", // Darker background
        backgroundColor: `rgb(32, 32, 32)`,

        borderRadius: 25, // Round the corners
        paddingVertical: 10,
        paddingHorizontal: 20,
        // height: 60,
        bottom: 20,
        alignSelf: "center",
        width: "90%",
        alignItems: "center",
        borderColor: "#d8f000",
        borderWidth: 1,
        justifyContent: "space-between",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
})

export default CustomTabBar
