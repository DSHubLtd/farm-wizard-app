import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const CustomButton = ({
    title,
    handlePress,
    containerStyles,
    textStyles,
    isLoading,
    // bgColor = 'buttonColor'
}) => {
    return (
        <View className="bg-black/20 opacity-90 flex flex-row justify-center items-center mt-3 p-2 rounded-lg">
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                className={`bg-buttonColor rounded-xl min-h-[52px] flex flex-row justify-center items-center ${containerStyles} ${isLoading ? "opacity-50" : ""
                    }`}
                disabled={isLoading}
            >
                <Text className={`text-white font-primary text-[22px] ${textStyles}`}>
                    {title}
                </Text>

                {isLoading && (
                    <ActivityIndicator
                        animating={isLoading}
                        color="#fff"
                        size="small"
                        className="ml-2"
                    />
                )}
            </TouchableOpacity>
        </View>
    );
};

export default CustomButton;
