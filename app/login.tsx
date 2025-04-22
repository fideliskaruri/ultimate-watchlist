import React, { useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import CustomButton from '@/components/ui/CustomButton';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import GrainOverlay from '@/components/GrainOverlay';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface GradientTextProps {
    text: string;
    style: object;
    gradientColors: readonly [string, string, ...string[]];
}

// Custom Text Gradient component
const GradientText: React.FC<GradientTextProps> = ({ text, style, gradientColors }) => {
    return (
        <MaskedView
            maskElement={
                <Text style={style}>
                    {text}
                </Text>
            }
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={[style, { opacity: 0 }]}>
                    {text}
                </Text>
            </LinearGradient>
        </MaskedView>
    );
};

export default function Login(): React.JSX.Element {
    const { user, isLoading, signInWithGoogle } = useAuth();

    // Redirect to main app if already logged in
    useEffect(() => {
        if (user) {
            router.replace('/(app)/(tabs)');
        }
    }, [user]);

    const handleGoogleLogin = async (): Promise<void> => {
        await signInWithGoogle();
    };

    return (
        <View style={styles.rootContainer}>
            <ImageBackground
                source={require('@/assets/images/tv_pic.jpg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            >
                {/* Enhanced grain effect with more pronounced texture */}
                <GrainOverlay opacity={0.4} />
{/* 
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.1)']}
                    style={styles.gradientOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.8 }}
                /> */}

                <View style={styles.container}>
                    <GradientText
                        text="Sync Your Watchlists"
                        style={styles.title}
                        gradientColors={[Colors.dark.tint, '#E8FF00', '#F4FFB8'] as const}
                    />
                    <Text style={styles.subtitle}>
                        Easily sync all your watchlists with friends and discover new favorites together.
                    </Text>
                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title={isLoading ? "Signing in..." : "Continue with Google"}
                            onPress={handleGoogleLogin}
                            style={styles.button}
                            icon={<AntDesign name="google" size={20} color="white" style={styles.buttonIcon} />}
                            disabled={isLoading}
                        />
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
        width: '100%',
    },
    title: {
        fontSize: 32,
        width: '100%',
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginBottom: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 1.5, height: 1.5 },
        textShadowRadius: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 19,
        color: Colors.dark.text,
        marginBottom: 50,
        textAlign: 'center',
        lineHeight: 28,
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowRadius: 5,
        opacity: 0.95,
        letterSpacing: 0.3,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 70,
    },
    button: {
        backgroundColor: 'rgba(216, 240, 0, 0.3)',
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 7,
        borderBlockColor: Colors.dark.tint,
        borderWidth: 1,
        borderColor: Colors.dark.tint,
    },
    buttonIcon: {
        marginRight: 8
    }
});