import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AppText from '@/components/AppText';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { createGame } from '@/utils/games';
import { getRandomTeamName } from '@/utils/nameGenerator';
import { Team } from '@/utils/types';

export default function StartGameSetup() {
  const [hostName, setHostName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [startSlurks, setStartSlurks] = useState<number>(50);
  const [error, setError] = useState('');
  const router = useRouter();

  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const generateRandomTeamName = () => {
    const randomName = getRandomTeamName();
    setTeamName(randomName);
  };

  const navigateToStartGame = async () => {
    if (!hostName.trim()) {
      setError('Skriv inn navn');
      return;
    }
    
    if (hostName.trim().length > 20) {
      setError('Navnet kan ikke være lengre enn 20 tegn');
      return;
    }
    
    if (!teamName.trim()) {
      setError('Velg et lagnavn');
      return;
    }
    
    if (teamName.trim().length > 25) {
      setError('Lagnavnet kan ikke være lengre enn 25 tegn');
      return;
    }
    
    const code = generateId(); // f.eks. "XKW32P"
    const finalTeamName = teamName.trim();

    await AsyncStorage.setItem('gameCode', code);
    await AsyncStorage.setItem('teamName', finalTeamName);
    await AsyncStorage.setItem('playerName', hostName);
    await AsyncStorage.setItem('isHost', 'true');

    // Opprett lag-array med hostens lag og evt. testlag
    const teams: Team[] = [
      {
        teamName: finalTeamName,
        players: [
          {
            id: generateId(),
            name: hostName,
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

    // Opprett spill i databasen med default startverdi (100)
    const { data, error } = await createGame(code, teams, startSlurks, hostName);
    if (error) {
      alert("Feil ved opprettelse av spill: " + error);
      return;
    }

    router.push({
      pathname: '/startGame',
      params: { code }
    });
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <AppText style={styles.title}>Start nytt spill</AppText>

        <TextInput
          style={styles.input}
          placeholder="Ditt navn"
          placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
          value={hostName}
          onChangeText={setHostName}
        />

        <View style={styles.teamNameContainer}>
          <TextInput
            style={styles.teamNameInput}
            placeholder="Lagnavn"
            placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
            value={teamName}
            onChangeText={setTeamName}
          />
          <Pressable style={styles.randomButton} onPress={generateRandomTeamName}>
            <Text style={styles.randomButtonText}>🎲</Text>
          </Pressable>
        </View>

        <AppText style={styles.subtitle}>Start Slurker:</AppText>
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, startSlurks === 20 && styles.modeButtonSelected]}
            onPress={() => setStartSlurks(20)}
          >
            <AppText style={styles.modeButtonText}>Småslurking (20)</AppText>
          </Pressable>
          <Pressable
            style={[styles.modeButton, startSlurks === 50 && styles.modeButtonSelected]}
            onPress={() => setStartSlurks(50)}
          >
            <AppText style={styles.modeButtonText}>Festmodus (50)</AppText>
          </Pressable>
          <Pressable
            style={[styles.modeButton, startSlurks === 100 && styles.modeButtonSelected]}
            onPress={() => setStartSlurks(100)}
          >
            <AppText style={styles.modeButtonText}>Blackout (100)</AppText>
          </Pressable>
        </View>

        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

        <Pressable style={styles.button} onPress={navigateToStartGame}>
          <AppText style={styles.buttonText}>Neste</AppText>
        </Pressable>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0E3C0',
    marginTop: 8,
  },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#D49712',
    borderRadius: 15,
    fontSize: 25,
    backgroundColor: '#073510',
    color: '#F0E3C0',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  modeButton: {
    backgroundColor: '#073510',
    borderColor: '#D49712',
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    minWidth: 80,
    marginHorizontal: 2,
  },
  modeButtonSelected: {
    backgroundColor: '#D49712',
    borderColor: '#D49712',
  },
  modeButtonText: {
    color: '#F0E3C0',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D49712',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
    marginTop: 12,
  },
  buttonText: {
    color: '#F0E3C0',
    fontWeight: 'bold',
    fontSize: 25,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    gap: 10,
  },
  randomButton: {
    backgroundColor: '#D49712',
    borderRadius: 15,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  randomButtonText: {
    fontSize: 20,
    color: '#F0E3C0',
  },
  teamNameInput: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#D49712',
    borderRadius: 15,
    fontSize: 25,
    backgroundColor: '#073510',
    color: '#F0E3C0',
  },
});

