import ExpandableFloatingButton from "@/components/ui/FloatButton"
import { useAuth } from "@/context/AuthContext"
import { DarkTheme, ThemeProvider } from "@react-navigation/native"
import { Redirect, Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { ActionButtonProps } from "@/src/interfaces"

const _layout = () => {
    const { user } = useAuth();

    useEffect(() => {
        const checkUser = async () => {
            console.log("user", user);
        };
        checkUser();
    }, []);

    // Define FAB actions - these can now be dynamic based on app state
    const fabActions: ActionButtonProps[] = [
        {
            icon: 'videocamera',
            label: 'New Watchlist',
            onPress: () => console.log('Create new watchlist'),
            backgroundColor: '#FF5252',
            // Pass query details with collection path and data structure
            query: {
                operation: 'set',
                collection: 'watchlists',
                data: {
                    title: '',
                    description: '',
                    titles: [],
                    visibility: "private"

                },
            }
        },
        {
            icon: 'appstore-o',
            label: 'New Category',
            onPress: () => console.log('Create new category'),
            backgroundColor: '#4CAF50',
            query: {
                operation: 'set',
                collection: 'categories',
                data: {
                    name: '',
                    description: '',
                }
            }
        },
        {
            icon: 'addusergroup',
            label: 'New Room',
            onPress: () => console.log('Create friend group'),
            backgroundColor: '#ff6c00',
            query: {
                operation: 'set',
                collection: 'rooms',
                data: {
                    name: '',
                    members: [],
                    description: '',
                }
            }
        }
    ];

    return (
        <ThemeProvider value={DarkTheme}>
            {user ? (
                <>
                    <ExpandableFloatingButton
                        actions={fabActions}
                        mainButtonColor="#fff"
                    />
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <StatusBar style="auto" />
                    </Stack>
                </>
            ) : (
                <Redirect href="/login" />
            )}
        </ThemeProvider>
    )
}

export default _layout