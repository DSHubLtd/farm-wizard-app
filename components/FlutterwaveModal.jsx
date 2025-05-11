import React from 'react';
import { Modal, View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const FlutterwaveModal = ({
    visible,
    onRequestClose,
    name,
    email,
    amount,
    txRef,
    publicKey,
    currency = "NGN",
    onSuccess,
    onCancel,
}) => {
    const getPaymentOptions = (currency) => {
        switch (currency) {
            case 'USD':
            case 'EUR':
                return 'card';
            case 'NGN':
                return 'card, banktransfer, ussd';
            case 'GHS':
                return 'card, mobilemoneyghana';
            case 'KES':
                return 'card, mpesa';
            default:
                return 'card';
        }
    };

    const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.flutterwave.com/v3.js"></script>
      </head>
      <body onload="makePayment()" style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
        <script>
          function makePayment() {
            FlutterwaveCheckout({
              public_key: '${publicKey}',
              tx_ref: '${txRef}',
              amount: ${amount},
              currency: '${currency}',
              payment_options: '${getPaymentOptions}',
              customer: {
                email: '${email}',
                name:'${name}',
              },
              callback: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', ...response }));
              },
              onclose: function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
              },
              customizations: {
                title: "Farm Wizard Payment",
                description: "Payment for farm items",
                logo: "https://your-logo-url.com/logo.png",
              },
            });
          }
        </script>
      </body>
    </html>
  `;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onRequestClose}
            transparent
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: htmlContent }}
                        onMessage={(event) => {
                            try {
                                const data = JSON.parse(event.nativeEvent.data);
                                //console.log('Flutterwave data:', data);

                                if (data.status === 'success') {
                                    onSuccess(data);
                                } else if (data.tx_ref || data.transaction_id) {
                                    // Still try to verify if there's transaction data
                                    onSuccess(data); // fallback — we'll verify server-side
                                } else {
                                    onCancel();
                                }
                            } catch (err) {
                                console.warn("Flutterwave parse error:", err.message);
                                onCancel();
                            }

                            onRequestClose();
                        }}

                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // dim background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: width * 0.9,
        height: height * 0.85,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 10,
    },
});

export default FlutterwaveModal;
