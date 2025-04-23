import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const BackgroundImage = ({
    source,
    blurRadius = 6,
    style,
    overlayColor = 'rgba(0, 0, 0, 0.4)',
}) => {
    return (
        <View style={[styles.container, style]}>
            <Image
                source={source}
                style={styles.image}
                resizeMode="cover"
                blurRadius={blurRadius}
            // className="h-full"
            />
            <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default BackgroundImage;
