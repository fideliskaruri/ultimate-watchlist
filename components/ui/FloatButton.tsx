import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    View, TouchableOpacity, Text, StyleSheet,
    Animated, Easing, Dimensions, TextInput, Button, Alert, Modal
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { db, auth } from '@/constants/firebaseconfig';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid/non-secure';
import { ActionButtonProps, FirestoreQuery } from '@/src/interfaces';

const { height } = Dimensions.get("window");

type ExpandableFloatingButtonProps = {
    actions: ActionButtonProps[];
    mainButtonColor?: string;
};

// Custom dropdown component
const CustomDropdown: React.FC<{
    options: string[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
}> = ({ options, value, onSelect, placeholder = "Select an option" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View style={dropdownStyles.container}>
            <TouchableOpacity
                style={dropdownStyles.header}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={dropdownStyles.headerText}>
                    {value ? value.charAt(0).toUpperCase() + value.slice(1) : placeholder}
                </Text>
                <AntDesign
                    name={isOpen ? "up" : "down"}
                    size={16}
                    color="#555"
                />
            </TouchableOpacity>

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

const ExpandableFloatingButton: React.FC<ExpandableFloatingButtonProps> = ({
    actions,
    mainButtonColor = "#1890ff",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const overlayAnimation = useRef(new Animated.Value(0)).current;
    const [modalVisible, setModalVisible] = useState(false);
    const [activeQuery, setActiveQuery] = useState<FirestoreQuery | null>(null);

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;

        Animated.parallel([
            Animated.timing(animation, {
                toValue,
                duration: 300,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
            }),
            Animated.timing(overlayAnimation, {
                toValue,
                duration: 300,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false,
            }),
        ]).start();

        setIsOpen(!isOpen);
    };

    const openModalWithQuery = (query: FirestoreQuery) => {
        setActiveQuery(query);
        setModalVisible(true);
        toggleMenu();
    };

    const closeModal = () => {
        setModalVisible(false);
        setActiveQuery(null);
    };

    const renderActionButton = useCallback((action: ActionButtonProps, index: number) => {
        const yOffset = height * 0.4;
        const spacing = (height * 0.5) / (actions.length + 1);
        const y = yOffset - spacing * (index + 1);

        return (
            <Animated.View
                key={action.label}
                style={[
                    styles.actionButton,
                    {
                        top: y,
                        transform: [{ scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
                        opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                    },
                ]}
            >
                <View style={styles.actionButtonContainer}>
                    <Text style={styles.label}>{action.label}</Text>
                    <TouchableOpacity
                        style={[
                            styles.actionButtonInner,
                            { backgroundColor: action.backgroundColor || "#3498db" },
                        ]}
                        onPress={() => {
                            if (action.query) {
                                openModalWithQuery(action.query);
                            } else {
                                action.onPress();
                                toggleMenu();
                            }
                        }}
                    >
                        {action.iconType === "MaterialIcons" ? (
                            <MaterialIcons name={action.icon as keyof typeof MaterialIcons.glyphMap} size={16} color="white" />
                        ) : (
                            <AntDesign name={action.icon as keyof typeof AntDesign.glyphMap} size={16} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }, [animation, actions, height]);

    return (
        <>
            <Animated.View
                style={[
                    styles.overlay,
                    {
                        opacity: overlayAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
                        pointerEvents: isOpen ? "auto" : "none",
                    },
                ]}
            >
                <TouchableOpacity style={styles.overlayTouchable} onPress={toggleMenu} activeOpacity={1} />
            </Animated.View>

            <View style={styles.container}>
                {isOpen && actions.map(renderActionButton)}

                <TouchableOpacity style={[styles.mainButton, { backgroundColor: mainButtonColor }]} onPress={toggleMenu}>
                    <Animated.View
                        style={{
                            transform: [{ rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] }) }],
                        }}
                    >
                        <AntDesign name="plus" size={16} color="#000" />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <FormModal
                modalVisible={modalVisible}
                closeModal={closeModal}
                activeQuery={activeQuery}
            />
        </>
    );
};

interface FormModalProps {
    modalVisible: boolean;
    closeModal: () => void;
    activeQuery: FirestoreQuery | null;
}

const FormModal: React.FC<FormModalProps> = ({ modalVisible, closeModal, activeQuery }) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (activeQuery?.data) {
            setFormData({ ...activeQuery.data });
        } else {
            setFormData({});
        }
    }, [activeQuery]);

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleFormSubmit = async () => {
        if (!activeQuery) return;
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to perform this action');
            return;
        }

        try {
            const docId = activeQuery.docId || nanoid(20);

            const finalData = {
                ...formData,
                createdBy: auth.currentUser.uid,
                createdAt: new Date().toISOString()
            };

            const docRef = doc(db, activeQuery.collection,  docId);

            await setDoc(docRef, finalData, { merge: true });

            const userDocRef = doc(db, 'users', auth.currentUser.uid, formData['visibility'], activeQuery.collection);

            await setDoc(userDocRef, {
                [activeQuery.collection]: arrayUnion(docId)
            }, { merge: true });

            Alert.alert('Success', `${activeQuery.collection} created successfully!`);
            closeModal();
        } catch (error: any) {
            console.error("Error performing Firestore operation: ", error);
            Alert.alert('Error', error.message);
        }
    };

    if (!activeQuery) return null;

    const getTitle = () => {
        const collection = activeQuery.collection;
        return `Create new ${collection.charAt(0).toUpperCase() + collection.slice(1, -1)}`;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{getTitle()}</Text>

                    {Object.keys(formData).map((field) => (
                        <View key={field} style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                {field.charAt(0).toUpperCase() + field.slice(1)}:
                            </Text>

                            {field == 'visibility' ?
                                <CustomDropdown
                                    options={['Private', 'Public', 'Friends']}
                                    value={formData[field] || ''}
                                    onSelect={(value) => handleInputChange(field, value)}
                                    placeholder="Select visibility"
                                /> :

                                <TextInput
                                    style={styles.input}
                                    value={
                                        Array.isArray(formData[field])
                                            ? formData[field].join(', ')
                                            : String(formData[field] || '')
                                    }
                                    onChangeText={(text) => handleInputChange(field, text)}
                                    placeholder={`Enter ${field}`}

                                />
                            }

                        </View>
                    ))}

                    <View style={styles.buttonContainer}>
                        <Button title="Cancel" onPress={closeModal} color="#FF5252" />
                        <Button title="Create" onPress={handleFormSubmit} color="#4CAF50" />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        zIndex: 1,
    },
    overlayTouchable: {
        width: "100%",
        height: "100%",
    },
    container: {
        position: "absolute",
        alignItems: "center",
        bottom: 120,
        right: 24,
        zIndex: 2,
    },
    mainButton: {
        width: 40,
        height: 40,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 3,
    },
    actionButton: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        width: 200,
        zIndex: 3,
    },
    actionButtonContainer: {
        bottom: 300,
        right: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: 150,
        zIndex: 3,
    },
    actionButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 3,
    },
    label: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    fieldContainer: {
        width: '100%',
        marginBottom: 15
    },
    fieldLabel: {
        fontSize: 16,
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20
    }
});

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

export default ExpandableFloatingButton;