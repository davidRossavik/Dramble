import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const backgroundImage = require('../../assets/images/background.png');

export default function UpOrDownStartScreen() {
  const [slurker, setSlurker] = useState(0);
  const router = useRouter();

  const increase = () => setSlurker(prev => prev + 1);
  const decrease = () => setSlurker(prev => Math.max(0, prev - 1));

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Up or Down</Text>

        <Text style={styles.label}>Antall slurker</Text>

        <View style={styles.counterContainer}>
          <Pressable onPress={decrease}>
            <Text style={styles.counterButton}>-</Text>
          </Pressable>

          <Text style={styles.slurkerText}>{slurker}</Text>

          <Pressable onPress={increase}>
            <Text style={styles.counterButton}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.spillButton}
          onPress={() => router.push('/vinn-slurker/upOrDownGame')}
        >
          <Text style={styles.spillButtonText}>Spill</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => console.log('Skipped')}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    fontFamily: 'serif', // Justér til ønsket font
  },
  label: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    fontFamily: 'serif',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  counterButton: {
    fontSize: 32,
    color: 'white',
    paddingHorizontal: 20,
  },
  slurkerText: {
    fontSize: 32,
    color: 'white',
    marginHorizontal: 10,
  },
  spillButton: {
    backgroundColor: '#f9c80e',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 100,
    marginBottom: 20,
  },
  spillButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 100,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
