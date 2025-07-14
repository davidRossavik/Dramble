import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { addTeamToGame, getGameByCode } from '@/utils/games';
import { getRandomTeamName } from '@/utils/nameGenerator';

export default function JoinGame() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

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

    // Random Lagnavn-generator //
    const existingNames = existingTeams.map((team: { teamName: any; }) => team.teamName);
    const randomTeamName = getRandomTeamName(existingNames);
    // Random Lagnavn-generator //

    const newTeam = {
        teamName: randomTeamName,
        slurks: 100, //hardkode for testing
        players: [{
            id: generateId(), // Eller crypto.randomUUID
            name: cleanName,
        }],
    };

    await addTeamToGame(gameId, newTeam, 100);

    await AsyncStorage.setItem('gameCode', code);
    await AsyncStorage.setItem('teamName', randomTeamName); 
    await AsyncStorage.setItem('playerName', cleanName); 
    await AsyncStorage.setItem('isHost', 'false');

    setError('');
    router.push(`/startGame?code=${code.trim().toUpperCase()}`);
  };




   return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Bli med i spill</Text>

        <TextInput
          style={[styles.input, {color: '#F0E3C0'}]}
          placeholder="Spillkode"
          placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <TextInput
          style={[styles.input, {color: '#F0E3C0'}]}
          placeholder="Ditt navn"
          placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
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
    gap: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#D49712',
    borderRadius: 15,
    fontSize: 25,
    backgroundColor: '#073510'
  },
  button: {
    backgroundColor: '#D49712',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
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