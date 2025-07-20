import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const backgroundImage = require('../../assets/images/background.png');
const wheelImage = require('../../assets/images/spinTheWheel.png');
const arrowImage = require('../../assets/images/pil.png');

const { width } = Dimensions.get('window');

// const segments = [
//   'Drikk 3 slurker',
//   '+10 slurker',
//   '-5 slurker',
//   '+10 slurker',
//   'ingenting',
//   '-5 slurker',
// ];

export default function SpinTheWheelScreen() {
  const rotation = useRef(new Animated.Value(0)).current;
  const [hasSpun, setHasSpun] = useState(false);
  const [totalRotation, setTotalRotation] = useState(0);

  const spinWheel = () => {
    if (hasSpun) return;
    setHasSpun(true);

    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const newRotation = totalRotation + 360 * 5 + randomExtraDegrees;

    Animated.timing(rotation, {
      toValue: newRotation,
      duration: 4000,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      const finalRotation = newRotation % 360;

      const pointerOffset = 180;
      const adjustedAngle = (finalRotation + pointerOffset) % 360;

      const segmentMap = [
        { label: '+10 slurker', start: 330, end: 360 },
        { label: '+10 slurker', start: 0, end: 30 },
        { label: 'ingenting', start: 30, end: 90 },
        { label: '-5 slurker', start: 90, end: 150 },
        { label: '+10 slurker', start: 150, end: 210 },
        { label: 'Drikk 3 slurker', start: 210, end: 270 },
        { label: '-5 slurker', start: 270, end: 330 },
      ];

      const result = segmentMap.find(({ start, end }) => {
        if (start < end) return adjustedAngle >= start && adjustedAngle < end;
        return adjustedAngle >= start || adjustedAngle < end;
      })?.label ?? 'Ukjent';

      Alert.alert('Resultat', result);
      setTotalRotation(newRotation);
    });
  };

  const spinInterpolation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.centerContainer}>

        {/* Tittel */}
        <Text style={styles.title}>S P I N  T H E  W H E E L</Text>

        {/* Hjul og pil i egen wrapper for nøyaktig plassering */}
        <View style={styles.wheelContainer}>
          <Image source={arrowImage} style={styles.arrow} />

          <Animated.Image
            source={wheelImage}
            style={[styles.wheel, { transform: [{ rotate: spinInterpolation }] }]}
          />
        </View>

        {/* Spinn-knapp */}
        <Pressable
          style={[styles.spinButton, hasSpun && styles.disabledButton]}
          onPress={spinWheel}
          disabled={hasSpun}
        >
          <Text style={styles.spinButtonText}>SPINN</Text>
        </Pressable>

        {/* Skip-knapp */}
        <Pressable style={styles.skipButton} onPress={() => console.log('Skipped')}>
          <Text style={styles.skipButtonText}>SKIP</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f9c80e',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  wheelContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: width * 0.75,
    height: width * 0.75,
    maxWidth: 300,
    maxHeight: 300,
    resizeMode: 'contain',
    zIndex: 1,
  },
  arrow: {
    position: 'absolute',
    left: -45,
    top: '50%',
    width: 60,
    height: 60,
    resizeMode: 'contain',
    transform: [
      { translateY: -30 },
      { rotate: '0deg' },
    ],
    zIndex: 2,
  },
  spinButton: {
    backgroundColor: '#f9c80e',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 100,
    marginTop: 40,
  },
  disabledButton: {
    opacity: 0.5,
  },
  spinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 100,
    marginTop: 20,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
