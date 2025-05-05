import React, { useRef, useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
// Uncomment below if you want thunder audio
// import { Audio } from 'expo-av';

const { height, width } = Dimensions.get("window");

const RainLayer = ({
  delay = 0,
  speed = 5000,
  heightFactor = 0.2,
  opacity = 0.5,
  drift = 0,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: speed,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: drift,
          duration: speed,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: speed,
          delay: delay,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.rainAnimated,
        {
          height: height * heightFactor,
          transform: [{ translateY }, { translateX }],
          opacity: fadeOut,
        },
      ]}
    >
      <LottieView
        source={require("../assets/rain.json")} // Replace with your Lottie rain JSON
        autoPlay
        loop
        style={styles.rainLottie}
      />
    </Animated.View>
  );
};

const RainEffect = ({ layers = 4, enableThunder = false }) => {
  const lightningOpacity = useRef(new Animated.Value(0)).current;

  // Optional: Thunder audio
  // const thunderSound = useRef(null);

  const triggerLightning = () => {
    Animated.sequence([
      Animated.timing(lightningOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(lightningOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Trigger again after random interval
      const delay = Math.random() * 7000 + 3000;
      setTimeout(triggerLightning, delay);
    });
  };

  useEffect(() => {
    if (enableThunder) {
      // If using sound, uncomment this block
      // const loadThunder = async () => {
      //   const { sound } = await Audio.Sound.createAsync(
      //     require('./assets/thunder.mp3')
      //   );
      //   thunderSound.current = sound;
      // };
      // loadThunder();
    }

    triggerLightning();

    return () => {
      // Clean up
      // if (thunderSound.current) {
      //   thunderSound.current.unloadAsync();
      // }
    };
  }, []);

  const rainLayers = Array.from({ length: layers }).map((_, index) => (
    <RainLayer
      key={index}
      delay={index * 800}
      speed={4000 + index * 500}
      heightFactor={0.2 + index * 0.05}
      opacity={0.5 - index * 0.05}
      drift={(index % 2 === 0 ? 1 : -1) * 10}
    />
  ));

  return (
    <>
      {rainLayers}
      {/* Lightning flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "white",
            opacity: lightningOpacity,
            zIndex: 10,
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  rainAnimated: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  rainLottie: {
    width: "100%",
    height: "100%",
  },
});

export default RainEffect;
