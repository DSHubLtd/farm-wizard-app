import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { images } from "@/constants";

export default function CutomSplashScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
            }),
        ]).start();

        // const timer = setTimeout(() => {
        //     router.replace("/auth");
        // }, 2000);

        // return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* <Image
                source={images.background}
                className="w-[100vw] h-[100vh]"
                resizeMode="cover" 
            /> */}
            <Image
                source={images.background1}
                className="absolute w-full h-full"
                resizeMode="cover"
                blurRadius={0.5}
            />
            <Image
                source={images.logoLg}
                resizeMode="contain"
                className="w-[250px] h-[250px]"
            />
            {/* <Animated.View
                style={[
                    styles.iconContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            > */}

            {/* <Ionicons name="medical" size={100} color="white" />
                <Text style={styles.appName}>MedRemind</Text> */}
            {/* </Animated.View> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        // backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        alignItems: "center",
    },
    appName: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        marginTop: 20,
        letterSpacing: 1,
    },
});
