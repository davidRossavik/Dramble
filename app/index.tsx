import { Team } from "@/utils/types";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { createGame } from "../utils/games";

import BackgroundWrapper from "@/components/BackgroundWrapper";

const logoImage = require('@/assets/images/textLogo.png');

export default function Index() {

  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  const router = useRouter();

  const navigateToStartGame = async () => {
    const code = generateId(); // f.eks. "XKW32P"

    const teams: Team[] = [
      {
        teamName: "Team Rød",
        leader: "Host",
        players: [
          {
            id: crypto.randomUUID(), // eller generateId(),
            name: "Host"
          }
        ]
      }
    ];

    const { data, error } = await createGame(code, teams);

    if (error) {
      alert("Feil ved opprettelse av spill: " + error);
      return;
    }

    // Naviger videre med spill-id og kode
    router.push({
      pathname: '/startGame', 
      params: { gameId: data.id, code }
    });
  };


  const navigateToJoinGame = () => {router.push('/joinGame')};

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
