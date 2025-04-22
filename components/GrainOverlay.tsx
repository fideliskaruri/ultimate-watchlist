import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface GrainOverlayProps {
    opacity?: number;
}

const { width, height } = Dimensions.get('window');

// Higher grain count for more detailed texture
const GRAIN_COUNT = 1000;

const GrainOverlay: React.FC<GrainOverlayProps> = ({ opacity = 0.08 }) => {
    // Generate an array of grain dots with random positions
    const grainDots = React.useMemo(() => {
        return Array.from({ length: GRAIN_COUNT }, (_, i) => ({
            key: `grain-${i}`,
            left: Math.random() * width,
            top: Math.random() * height,
            height: Math.random() * 1.2 + 0.3,
            width: Math.random() * 1.2 + 0.3,
            opacity: Math.random() * 0.8 + 0.2, // Random opacity for more natural look
        }));
    }, []);

    return (
        <View style={[styles.container, { opacity }]}>
            {grainDots.map((dot) => (
                <View
                    key={dot.key}
                    style={[
                        styles.grainDot,
                        {
                            left: dot.left,
                            top: dot.top,
                            width: dot.width,
                            height: dot.height,
                            opacity: dot.opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'none', // Make the overlay not block touch events
    },
    grainDot: {
        position: 'absolute',
        backgroundColor: 'yellow',
        borderRadius: 1,
    },
});

export default GrainOverlay;