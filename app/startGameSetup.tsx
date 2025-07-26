import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { createGame } from '@/utils/games';
import { getRandomTeamName } from '@/utils/nameGenerator';
import { Team } from '@/utils/types';

export default function StartGameSetup() {
  const [hostName, setHostName] = useState('');
  const [startSlurks, setStartSlurks] = useState<number>(50);
  const [error, setError] = useState('');
  const router = useRouter();

  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const navigateToStartGame = async () => {
    if (!hostName.trim()) {
      setError('Skriv inn navn');
      return;
    }
    const code = generateId(); // f.eks. "XKW32P"
    const teamName = getRandomTeamName(); // randomTeamName

    await AsyncStorage.setItem('gameCode', code);
    await AsyncStorage.setItem('teamName', teamName);
    await AsyncStorage.setItem('playerName', hostName);
    await AsyncStorage.setItem('isHost', 'true');

    // Opprett lag-array med hostens lag og evt. testlag
    const teams: Team[] = [
      {
        teamName: teamName,
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
        <Text style={styles.title}>Start nytt spill</Text>

        <TextInput
          style={styles.input}
          placeholder="Ditt navn"
          placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
          value={hostName}
          onChangeText={setHostName}
        />

        <Text style={styles.subtitle}>Velg gamemode:</Text>
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, startSlurks === 20 && styles.modeButtonSelected]}
            onPress={() => setStartSlurks(20)}
          >
            <Text style={styles.modeButtonText}>Småslurking (20)</Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, startSlurks === 50 && styles.modeButtonSelected]}
            onPress={() => setStartSlurks(50)}
          >
            <Text style={styles.modeButtonText}>Festmodus (50)</Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, startSlurks === 100 && styles.modeButtonSelected]}
            onPress={() => setStartSlurks(100)}
          >
            <Text style={styles.modeButtonText}>Blackout (100)</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={navigateToStartGame}>
          <Text style={styles.buttonText}>Neste</Text>
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
    width: '100%',
    justifyContent: 'center',
  },
  modeButton: {
    backgroundColor: '#073510',
    borderColor: '#D49712',
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 90,
    marginHorizontal: 3,
  },
  modeButtonSelected: {
    backgroundColor: '#D49712',
    borderColor: '#D49712',
  },
  modeButtonText: {
    color: '#F0E3C0',
    fontWeight: 'bold',
    fontSize: 16,
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
});

