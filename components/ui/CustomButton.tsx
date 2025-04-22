import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: ReactNode;
    disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style, textStyle, icon, disabled }) => {
    return (
        <TouchableOpacity 
            style={[styles.button, style, disabled && styles.buttonDisabled]} 
            onPress={onPress}
            disabled={disabled}
        >
            {icon}
            <Text style={[styles.text, textStyle, disabled && styles.textDisabled]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: '#D8F000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: '100%',
        gap: 12,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    textDisabled: {
        opacity: 0.8,
    },
    icon: {
        marginRight: 8,
    },
});

export default CustomButton;