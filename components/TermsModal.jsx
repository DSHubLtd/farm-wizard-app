import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const TermsModal = () => {
    const [visible, setVisible] = useState(false);
    const { height, width } = Dimensions.get('window');

    return (
        <View style={styles.container}>
            {/* Button to open modal */}
            <TouchableOpacity
                style={styles.openButton}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.buttonText}>View Terms & Conditions</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>

                        {/* Modal Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Terms and Conditions</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* WebView with border */}
                        <WebView
                            source={{ uri: `${API_BASE}/terms-and-conditions/T&C.html` }}
                            originWhitelist={['*']}
                            javaScriptEnabled
                            domStorageEnabled
                            startInLoadingState
                            injectedJavaScript={`
                const style = document.createElement('style');
                style.innerHTML = \`
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 16px;
                    padding: 20px;
                    line-height: 1.6;
                    background-color: #fff;
                    color: #000;
                  }
                \`;
                document.head.appendChild(style);
              `}
                            style={styles.webview}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TermsModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // your screen background
        justifyContent: 'center',
        alignItems: 'center',
    },
    openButton: {
        backgroundColor: '#E1CE67',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },
    buttonText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        flex: 0.85,
    },
    header: {
        backgroundColor: '#E1CE67',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    closeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    webview: {
        flex: 1,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
});
