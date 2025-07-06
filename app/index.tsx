import { useRouter } from "expo-router";
import { useState } from 'react';
import { Image, StyleSheet, View } from "react-native";
import * as Animatable from 'react-native-animatable';

import BackgroundWrapper from "@/components/BackgroundWrapper";
import Button from '@/components/Button';
import InfoModal from '@/components/InfoModal';

const logoImage = require('@/assets/images/textLogo.png');
const redButtonImage = require('@/assets/images/redButton.png');
const blackButtonImage = require('@/assets/images/blackButton.png');
const infoButtonImage = require('@/assets/images/infoButton.png');

export default function Index() {

  const [modalVisible, setModalVisible] = useState(false); // InfoModal
  const pressedInfoModal = () => {setModalVisible(true)};

  // Navigation // 
  const router = useRouter();
  const navigateToStartGame = () => {router.push('/startGame')};
  const navigateToJoinGame= () => {router.push('/joinGame')};

  return (
    <BackgroundWrapper>
      <View style={styles.container}>

        <Image source={logoImage} style={styles.logoImage} />

        <Animatable.View animation={'slideInRight'} duration={1500}>
          <Button imageSource={redButtonImage} imageStyle={styles.redButton} onPress={navigateToStartGame} />
        </Animatable.View>
        
        <Animatable.View animation={'slideInRight'} duration={2000}>
          <Button imageSource={blackButtonImage} imageStyle={styles.blackButton} onPress={navigateToJoinGame} />
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
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  blackButton: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginTop: 20,
  },
  infoButton: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    left: 110,
    top: 5,
  },
});

