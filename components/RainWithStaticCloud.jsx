import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const RainWithStaticCloud = () => {
    return (
        <View style={styles.container}>
            {/* Masked container: only rain appears to fall */}
            <View style={styles.lottieWrapper}>
                <LottieView
                    source={require("../assets/cloud-only.json")} // your Lottie file
                    autoPlay
                    loop
                    style={styles.lottie}
                // style={{
                //     width: 400, // wider cloud
                //     height: 150,
                //     alignSelf: "center", // center horizontally
                // }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 5,
    },
    lottieWrapper: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: 150, // only show a portion where rain begins
        overflow: "hidden",
    },
    lottie: {
        width: "100%",
        height: 300, // make taller than container so rain falls through
    },
});

export default RainWithStaticCloud;
