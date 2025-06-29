import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as Animatable from 'react-native-animatable';

import BackgroundWrapper from "@/components/BackgroundWrapper";

const logoImage = require('@/assets/images/textLogo.png');

export default function Index() {

  const router = useRouter();
  const navigateToStartGame = () => {router.push('/startGame')};
  const navigateToJoinGame= () => {router.push('/joinGame')};

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Image source={logoImage} style={styles.logoImage} />

        <Animatable.View animation="slideInRight" duration={1200}>
          <Pressable style={styles.redButton} onPress={navigateToStartGame}>
            <Text style={styles.buttonText}>Start spill</Text>
          </Pressable>
        </Animatable.View>

        <Animatable.View animation="slideInRight" duration={1600}>
          <Pressable style={styles.blackButton} onPress={navigateToJoinGame}>
            <Text style={styles.buttonText}>Bli med i spill</Text>
          </Pressable>
        </Animatable.View>
      </View>
    </BackgroundWrapper>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    gap: 20,
  },
  logoImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  redButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 100,
    marginTop: 20,
    alignItems: 'center',
  },
  blackButton: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 100,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
