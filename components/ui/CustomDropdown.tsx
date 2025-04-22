import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Custom dropdown component for our form
const CustomDropdown: React.FC<{
    options: string[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
}> = ({ options, value, onSelect, placeholder = "Select an option" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View style={dropdownStyles.container}>
            {/* Dropdown header/button */}
            <TouchableOpacity
                style={dropdownStyles.header}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={dropdownStyles.headerText}>
                    {value || placeholder}
                </Text>
                <AntDesign
                    name={isOpen ? "up" : "down"}
                    size={16}
                    color="#555"
                />
            </TouchableOpacity>

            {/* Dropdown options */}
            {isOpen && (
                <View style={dropdownStyles.optionsContainer}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                dropdownStyles.option,
                                value === option.toLowerCase() && dropdownStyles.selectedOption
                            ]}
                            onPress={() => {
                                onSelect(option.toLowerCase());
                                setIsOpen(false);
                            }}
                        >
                            <Text style={[
                                dropdownStyles.optionText,
                                value === option.toLowerCase() && dropdownStyles.selectedOptionText
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

// Separate styles for our dropdown
const dropdownStyles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        marginTop: 5,
        zIndex: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    headerText: {
        fontSize: 16,
        color: '#333',
    },
    optionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginTop: 2,
        maxHeight: 150,
        overflow: 'scroll',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedOption: {
        backgroundColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        fontWeight: 'bold',
    }
});