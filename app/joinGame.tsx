import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { addTeamToGame, getGameByCode } from '@/utils/games';

export default function JoinGame() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();



  const handleJoin = async () => {
    if (!code.trim()) {
      setError('Skriv inn en spillkode');
      return;
    }

    const cleanName = name.trim();

    const { data, error: fetchError } = await getGameByCode(code.trim().toUpperCase());
    if (fetchError || !data) {
      setError('Fant ikke spill med denne koden');
      return;
    }

    const gameId = data.id;
    const existingTeams = data.teams ?? [];

    const defaultTeamName = `Lag ${existingTeams.length + 1}`;

    const newTeam = {
        teamName: defaultTeamName,
        leader: cleanName,
        players: [{
            id: crypto.randomUUID(),
            name: cleanName,
        }],
    };

    await addTeamToGame(gameId, newTeam);

    await AsyncStorage.setItem('gameCode', code);
    await AsyncStorage.setItem('teamName', defaultTeamName); 
    await AsyncStorage.setItem('playerName', cleanName); 

    setError('');
    router.push(`/startGame?code=${code.trim().toUpperCase()}`);
  };




   return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Bli med i spill</Text>

        <TextInput
          style={styles.input}
          placeholder="Spillkode"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <TextInput
          style={styles.input}
          placeholder="Ditt navn"
          value={name}
          onChangeText={setName}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleJoin}>
          <Text style={styles.buttonText}>Bli med</Text>
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
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});