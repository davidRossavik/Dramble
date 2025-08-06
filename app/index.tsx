import { useRouter } from "expo-router";

import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from "react-native";

import * as Animatable from 'react-native-animatable';


import AppText from "@/components/AppText";
import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import InfoModal from '@/components/InfoModal';

const logoImage = require('@/assets/images/textLogo.png');
const redButtonImage = require('@/assets/images/redButton.png');
const blackButtonImage = require('@/assets/images/blackButton.png');
const infoButtonImage = require('@/assets/images/infoButton.png');


export default function Index() {

  // InfoModal //
  const [modalVisible, setModalVisible] = useState(false);
  const pressedInfoModal = () => {setModalVisible(true)};

  // Navigation //
  const router = useRouter();
  const navigateToStartGameSetup = () => router.push('/startGameSetup');
  const navigateToJoinGame = () => {router.push('/joinGame')};
  // Navigation //

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Image source={logoImage} style={styles.logoImage} />

        <Animatable.View animation="slideInRight" duration={1200}>
          <Pressable style={styles.redButton} onPress={navigateToStartGameSetup}>
            <AppText style={styles.buttonText}>Start spill</AppText>
          </Pressable>
        </Animatable.View>

        <Animatable.View animation="slideInRight" duration={1600}>
          <Pressable style={styles.blackButton} onPress={navigateToJoinGame}>
            <AppText style={styles.buttonText}>Bli med i spill</AppText>
          </Pressable>
        </Animatable.View>
        
        <Button imageSource={infoButtonImage} onPress={pressedInfoModal} imageStyle={styles.infoButton} />
        <InfoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
          
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
    backgroundColor: '#D49712',
    paddingVertical: Platform.OS === 'web' ? 20 : 28,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 60,
    borderRadius: 100,
    marginTop: 20,
    alignItems: 'center',
  },
  blackButton: {
    backgroundColor: '#000000',
    paddingVertical: Platform.OS === 'web' ? 20 : 28,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 60,
    borderRadius: 100,
    marginTop: Platform.OS === 'web' ? 20 : 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 25,
  },
  infoButton: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    left: 110,
    top: Platform.OS === 'web' ? 5 : 130,
  },
});
