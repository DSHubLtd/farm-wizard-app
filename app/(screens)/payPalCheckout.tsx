import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";

const PayPalCheckout = () => {
  let { approvalUrl: checkoutUrl } = useLocalSearchParams<{
    approvalUrl: string;
  }>();
  /*const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        // Fetch PayPal Order ID from your backend
        fetch('http://your-backend.com/api/create-paypal-order', {
            method: 'POST',
        })
            .then(res => res.json())
            .then(data => setOrderId(data.orderId))
            .catch(err => console.error(err));
    }, []);

    if (!orderId) {
        return <ActivityIndicator size="large" />;
    }*/

  const captureOrder = async (orderId: any) => {
    try {
      const captureRes = await fetch(
        `http://<your-server>/capture-order/${orderId}`,
        {
          method: "POST",
        }
      );

      const result = await captureRes.json();

      if (result.success) {
        // navigation.replace("SuccessScreen");
      } else {
        // Alert.alert("Payment Error", result.message || "Payment not completed");
        // navigation.replace("CancelScreen");
      }
    } catch (err) {
      //   Alert.alert("Error", "Could not capture payment");
      //   navigation.replace("CancelScreen");
    }
  };
  return (
    <WebView
      // source={{ uri: `https://www.paypal.com/checkoutnow?token=${orderId}` }}
      source={{ uri: checkoutUrl as string }}
      onNavigationStateChange={(navState: any) => {
        console.log("nav ", navState);
        // Optional: listen for success/cancel redirects
        if (navState.url.includes("success")) {
          // captureOrder(orderId);
          // payment successful
        }
        if (navState.url.includes("cancel")) {
          // payment cancelled
        }
      }}
      startInLoadingState
      renderLoading={() => <ActivityIndicator style={{ marginTop: 20 }} />}
    />
  );
};

export default PayPalCheckout;
