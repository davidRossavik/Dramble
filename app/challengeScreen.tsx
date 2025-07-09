import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { getGameByCode } from '@/utils/games';

export default function challengeScreen() {
  const router = useRouter();

  const [challenge, setChallenge] = useState<any>(null);
  const [challengeStatus, setChallengeStatus] = useState('');
  const [gameId, setGameId] = useState('');
  const [challengeIndex, setChallengeIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const gameCode = await AsyncStorage.getItem('gameCode');
      if (!gameCode) {
        router.replace('/');
        return;
      }

      const { data } = await getGameByCode(gameCode);
      if (!data) return;

      setGameId(data.id);
      setChallengeStatus(data.challenge_state || '');
      setChallengeIndex(data.current_challenge_index || 0);

      const current = data.challenges?.[data.current_challenge_index];
      setChallenge(current);
    };

    fetch();
  }, []);

  if (!challenge) {
    return (
      <View style={styles.container}>
        <Text>Henter challenge...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description}>{challenge.description}</Text>
      <Text style={styles.detail}>Type: {challenge.type}</Text>
      <Text style={styles.detail}>Odds: {challenge.odds}</Text>
      <Text style={styles.status}>Status: {challengeStatus}</Text>

      {/* Midlertidig knapp for testing */}
      <Button title="Gå tilbake" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
  },
  status: {
    marginTop: 20,
    fontStyle: 'italic',
    color: 'gray',
  },
});
