import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import CustomButton from './CustomButton';
import { icons } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

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

export const CustomPauseDialog = ({
    visible,
    onClose,
    onConfirmPress,
    onCancelPress,
    messageText = "Message",
    imageSource,
    confirmButtonText = "Ok",
    concelButtonText = "Cancel",
    isMuted = false,
    ontoggleMute
}) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            {/* <TouchableWithoutFeedback onPress={onClose}> */}
            <BlurView
                intensity={100}
                tint="dark"
                className="flex-1 items-center justify-center"
            >
                <View className="w-full items-end my-10">
                    <TouchableOpacity
                        className="bg-[#D5B85A] rounded-full items-center justify-center m-4 w-14 h-14"
                        onPress={ontoggleMute}
                    >
                        {isMuted ?
                            <Image source={icons.soundOn} className="w-8 h-8" /> :
                            <Image source={icons.soundOff} className="w-8 h-8" />}
                    </TouchableOpacity>
                </View>
                <View
                    className="bg-[#78693985] rounded-3xl w-[80%] h-[40%] p-4 items-center border border-yellow-300"
                >

                    <TouchableWithoutFeedback onPress={() => { }}>

                        <View className="flex-1 w-full bg-white opacity-2 rounded-3xl justify-center items-center">
                            <Text
                                className="text-center text-xl px-2 font-secondary my-10"
                                style={{
                                    color: "#80784A",
                                    textAlign: "center",
                                    paddingHorizontal: 10,
                                }}
                            >
                                {messageText}
                            </Text>
                            {imageSource && (
                                <Image source={imageSource} className="w-40 h-40 mb-2" />
                            )}

                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View className="flex-row w-full justify-center items-center gap-x-10 my-20">
                    <CustomButton
                        title={confirmButtonText}
                        handlePress={onConfirmPress}
                        containerStyles="w-[150px] "
                        textStyles="font-pbold text-white"
                        isLoading={false}
                    />
                    <CustomButton
                        title={concelButtonText}
                        handlePress={onCancelPress}
                        containerStyles="w-[150px] "
                        textStyles="font-pbold text-white"
                        isLoading={false}
                    />
                </View>
            </BlurView>
            {/* </TouchableWithoutFeedback> */}
        </Modal>
    );
};
