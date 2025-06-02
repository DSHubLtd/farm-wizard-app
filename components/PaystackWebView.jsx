
//paypal
// const startPayment = async () => {
//   const response = await fetch(
//     "${API_BASE}/api/v1/payment/paypal/create-order",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ amount: 25.5 }),
//     }
//   );

//   const { approvalUrl } = await response.json();
//   router.push({
//     pathname: "/(screens)/payPalCheckout",
//     params: { approvalUrl },
//   });
// };

// //paystack
// const verifyPayment = async (reference: any) => {
//   setLoading(true);
//   try {
//     const res = await fetch(
//       `https://your-server.com/verify-payment/${reference}`
//     );
//     const json = await res.json();

//     //  if (json.success) {
//     //    navigation.navigate("Success", { reference });
//     //  } else {
//     //    Alert.alert("Payment Error", "We couldn't verify the payment.");
//     //  }
//   } catch (e) {
//     //  Alert.alert("Error", e.message);
//   } finally {
//     setLoading(false);
//   }
// };

{/* <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <PaystackWebView
          visible={showPaystack}
          onRequestClose={() => setShowPaystack(false)}
          email="asad@example.com"
          amount={5000}
          publicKey="pk_test_1b8546e3570e35d656a4848a36b556822375fe30"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </View> */}
import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const PaystackWebView = ({
  visible,
  onRequestClose,
  email,
  amount,
  publicKey,
  onSuccess,
  onCancel,
}) => {
  const htmlContent = `
    <html>
      <head>
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </head>
      <body onload="payWithPaystack()">
        <script>
          function payWithPaystack(){
            var handler = PaystackPop.setup({
              key: '${publicKey}',
              email: '${email}',
              amount: ${amount} * 100,
              currency: "NGN",
              callback: function(response){
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', reference: response.reference }));
              },
              onClose: function(){
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
              }
            });
            handler.openIframe();
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
    >
      <View style={styles.container}>
        <WebView
          style={{ flex: 1 }}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'success') {
              onSuccess(data);
            } else {
              onCancel();
            }
            onRequestClose(); // Close modal after payment
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PaystackWebView;
