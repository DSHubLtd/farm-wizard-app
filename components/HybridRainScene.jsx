import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import RainEffect from "./RainEffect";

const HybridRainScene = () => {
    return (
        <View style={styles.container}>
            {/* Cloud Layer */}
            <LottieView
                source={require("../assets/cloud-only.json")}
                autoPlay
                loop
                style={styles.cloud}
            />

            {/* Stylized Rain Layer */}
            {Array.from({ length: 2 }).map((_, i) => (
                <LottieView
                    key={`lottie-rain-${i}`}
                    source={require("../assets/rain.json")}
                    autoPlay
                    loop
                    style={[
                        styles.lottieRain,
                        {
                            top: i * 100,
                            opacity: 0.3 + i * 0.3,
                        },
                    ]}
                />
            ))}

            {/* Procedural Rain Effect */}
            <RainEffect layers={50} enableThunder={false} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    cloud: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: 400,
        zIndex: 3,
    },
    lottieRain: {
        position: "absolute",
        width: "100%",
        height: '100%',
        zIndex: 2,
    },
});

export default HybridRainScene;
