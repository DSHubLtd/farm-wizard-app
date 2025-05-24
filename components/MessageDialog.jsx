import React from 'react';
import { Modal, View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import CustomButton from './CustomButton';

const MessageDialog = ({
    visible,
    onClose,
    onPress,
    messageText = "The magic’s eager, but your coins are few! Let’s visit the shop and fill that pouch.",
    imageSource,
    buttonText = "Ok",
}) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <BlurView intensity={50} tint="dark" className="flex-1 items-center justify-center">
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View className="flex-1 w-full bg-[#857f6e85] opacity-2 rounded-lg p-2 justify-center items-center">
                            {imageSource && (
                                <Image source={imageSource} className="w-40 h-40 mb-2" />
                            )}

                            <Text
                                className="text-center text-xl px-2 font-secondary my-10"
                                style={{
                                    color: "#fff",
                                    textAlign: "center",
                                    paddingHorizontal: 10,
                                }}
                            >
                                {messageText}
                            </Text>
                            <CustomButton
                                title={buttonText}
                                handlePress={onPress}
                                containerStyles="w-[200px] "
                                textStyles="font-pbold text-white"
                                isLoading={false}
                            />
                        </View>
                    </TouchableWithoutFeedback>

                </BlurView>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default MessageDialog;
