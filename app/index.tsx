import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import * as Animatable from 'react-native-animatable';

import { getRandomTeamName } from "@/utils/nameGenerator";
import { Team } from "@/utils/types";
import { createGame } from "../utils/games";

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
  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const [startSlurks, setStartSlurks] = useState<number>(50); // Ny state for startverdi

  const navigateToStartGame = async () => {
    const code = generateId(); // f.eks. "XKW32P"
    const teamName = getRandomTeamName(); // randomTeamName

    await AsyncStorage.setItem('gameCode', code);
    await AsyncStorage.setItem('teamName', teamName);
    await AsyncStorage.setItem('playerName', "Host");
    await AsyncStorage.setItem('isHost', 'true');

    // Opprett lag-array med hostens lag og evt. testlag
    const teams: Team[] = [
      {
        teamName: teamName,
        players: [
          {
            id: generateId(),
            name: "Host"
          }
        ]
      }
    ];
    // Hardkode to ekstra lag for testing
    teams.push(
      {
        teamName: "Testlag 1",
        players: [{ id: "T1P1", name: "Test1" }]
      },
      {
        teamName: "Testlag 2",
        players: [{ id: "T2P1", name: "Test2" }]
      }
    );

    // Opprett spill i databasen med default startverdi (50)
    const { data, error } = await createGame(code, teams, 50);
    if (error) {
      alert("Feil ved opprettelse av spill: " + error);
      return;
    }

    router.push({
      pathname: '/startGame',
      params: { code }
    });
  };

  const navigateToJoinGame = () => {router.push('/joinGame')};
  // Navigation //

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
    backgroundColor: '#FF3B30',
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
