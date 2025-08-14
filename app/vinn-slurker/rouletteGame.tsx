import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const rouletteHjul = require('@/assets/images/rouletteHjul.png');
const hvitBall = require('@/assets/images/hvitBall.png');

// Liste over sektorer (tall og vinkler)
const wheelSectors = [
  { number: 0,  start: 355.135, end:   4.865 },
  { number: 32, start:   4.865, end:  14.594 },
  { number: 15, start:  14.594, end:  24.324 },
  { number: 19, start:  24.324, end:  34.054 },
  { number: 4,  start:  34.054, end:  43.784 },
  { number: 21, start:  43.784, end:  53.514 },
  { number: 2,  start:  53.514, end:  63.243 },
  { number: 25, start:  63.243, end:  72.973 },
  { number: 17, start:  72.973, end:  82.703 },
  { number: 34, start:  82.703, end:  92.432 },
  { number: 6,  start:  92.432, end: 102.162 },
  { number: 27, start: 102.162, end: 111.892 },
  { number: 13, start: 111.892, end: 121.622 },
  { number: 36, start: 121.622, end: 131.351 },
  { number: 11, start: 131.351, end: 141.081 },
  { number: 30, start: 141.081, end: 150.811 },
  { number: 8,  start: 150.811, end: 160.541 },
  { number: 23, start: 160.541, end: 170.270 },
  { number: 10, start: 170.270, end: 180.000 },
  { number: 5,  start: 180.000, end: 189.730 },
  { number: 24, start: 189.730, end: 199.459 },
  { number: 16, start: 199.459, end: 209.189 },
  { number: 33, start: 209.189, end: 218.919 },
  { number: 1,  start: 218.919, end: 228.649 },
  { number: 20, start: 228.649, end: 238.378 },
  { number: 14, start: 238.378, end: 248.108 },
  { number: 31, start: 248.108, end: 257.838 },
  { number: 9,  start: 257.838, end: 267.568 },
  { number: 22, start: 267.568, end: 277.297 },
  { number: 18, start: 277.297, end: 287.027 },
  { number: 29, start: 287.027, end: 296.757 },
  { number: 7,  start: 296.757, end: 306.486 },
  { number: 28, start: 306.486, end: 316.216 },
  { number: 12, start: 316.216, end: 325.946 },
  { number: 35, start: 325.946, end: 335.676 },
  { number: 3,  start: 335.676, end: 345.405 },
  { number: 26, start: 345.405, end: 355.135 },
];

// Regner ut ballens X/Y-posisjon på banen for en vinkel i grader
function calcBallPosition(deg: number) {
  const orbitRadius = width * 0.35;
  const rad = (deg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * orbitRadius,
    y: Math.sin(rad) * orbitRadius,
  };
}

export default function RouletteGame() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);

  // Ballens posisjon
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });

  // Fade-effekt for instruksjonstekst
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);

    // TODO: bytt ut med tilfeldig sektor
    const sector = wheelSectors[0];
    const midAngle = sector.start > sector.end
      ? 0
      : (sector.start + sector.end) / 2;
    setBallPos(calcBallPosition(midAngle));

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => setSpinning(false));
  };

  // Hjulrotasjon: 0–720°
  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.rouletteContainer}>
        <Pressable onPress={spinWheel} disabled={spinning}>
          <Animated.Image
            source={rouletteHjul}
            style={[styles.roulette, { transform: [{ rotate }] }]} />
        </Pressable>
        {/* Ball plassert i sin posisjon */}
        <View style={[
          styles.ballContainer,
          { top: width * 0.115 + ballPos.y - 7.5, left: width * 0.047 + ballPos.x - 7.5 }
        ]}>
          <Image source={hvitBall} style={styles.ball} />
        </View>
      </View>

      <Animated.Text style={[styles.tapText, { opacity: fadeAnim }]}>Trykk på hjulet 🎯</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b4332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rouletteContainer: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
  },
  roulette: { width: '100%', height: '100%', resizeMode: 'contain' },
  ballContainer: { position: 'absolute' },
  ball: { width: 15, height: 15 },
  tapText: { fontSize: 20, color: 'white', marginTop: 20, fontWeight: 'bold' },
});
