
import { Modal, View, StyleSheet, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { icons, images } from '../constants';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get("window");

const RewardModal = ({ visible, onClose }) => {
    const { t } = useTranslation();

    return (
        <Modal transparent visible={visible} animationType="fade">
            <BlurView
                intensity={50}
                tint="dark"
                className="flex-1 items-center justify-center"
            >
                <View
                    className="bg-black/40 rounded-2xl w-[100%] h-[100%] p-2 items-center shadow-2xl"
                >
                    <View className="w-full items-end my-20">
                        <TouchableOpacity
                            className="bg-yellow-300 rounded-full items-center justify-center w-20 h-20"
                            onPress={onClose}
                        >
                            <Image source={icons.close} className="w-10 h-10" />
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={images.adsBadge}
                        style={{
                            width: width * 0.5,
                            height: width * 0.5,
                        }}
                        resizeMode="contain"
                    />

                    <Text className="text-white text-xl text-center mb-6">
                        {t("messages.watch_ads")}
                    </Text>

                    <View className="flex-row justify-center items-center">
                        <TouchableOpacity
                            className="bg-buttonColor flex-row rounded-xl items-center justify-center p-4 m-2"
                            onPress={() => setShowAd(true)}
                        >
                            <Image source={icons.play} className="w-10 h-10 mr-2" />
                            <Text className="text-white text-lg">Watch Ads</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </BlurView>
        </Modal>
        // <Modal
        //     animationType="fade"
        //     visible={visible}
        //     onRequestClose={onClose}
        //     transparent={false}
        // >
        //     <View style={styles.container}>
        //         <View style={styles.header}>
        //             <TouchableOpacity onPress={onClose}>
        //                 <Text style={styles.closeText}>Close</Text>
        //             </TouchableOpacity>
        //         </View>
        //         <WebView source={{ uri: url }} style={styles.webview} />
        //     </View>
        // </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#f8f8f8',
        alignItems: 'flex-end',
        paddingRight: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    closeText: {
        color: '#007AFF',
        fontSize: 18,
    },
    webview: {
        flex: 1,
    },
});

export default RewardModal;

