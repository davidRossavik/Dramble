import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const imageBackground = require('@/assets/images/background.png');

type Props = {
    children: React.ReactNode;
}

export default function BackgroundWrapper({children}: Props) {
    return (
        <ImageBackground source={imageBackground} style={styles.container}>
            {children}
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        resizeMode: 'cover',
        backgroundColor: 'green',
    },
});