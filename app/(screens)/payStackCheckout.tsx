import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

const PayStackCheckout = () => {
  const { email, amount, publicKey, onSuccess, onCancel } =
    useLocalSearchParams();

  const htmlContent = `
    <html>
      <head>
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </head>
      <body onload="payWithPaystack()" style="margin:0;padding:0;">
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

  const handleMessage = (event: any) => {
    // const data = JSON.parse(event.nativeEvent.data);
    // if (data.status === "success") {
    //   onSuccess(data);
    // } else {
    //   onCancel();
    // }
    // navigation.goBack(); // Navigate back after transaction
  };

  return (
    <View style={styles.container}>
      <WebView
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});

export default PayStackCheckout;
