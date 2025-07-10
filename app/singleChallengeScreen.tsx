import { getGameByCode } from '@/utils/games';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../supabase';

export default function SingleChallengeScreen() {
  const router = useRouter();

  const [gameCode, setGameCode] = useState('');
  const [gameId, setGameId] = useState('');
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeStatus, setChallengeStatus] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [slurksBet, setSlurksBet] = useState('10');

  // Last inn lagret spillerinfo
  useEffect(() => {
    const load = async () => {
      const code = await AsyncStorage.getItem('gameCode');
      const name = await AsyncStorage.getItem('playerName');
      const team = await AsyncStorage.getItem('teamName');

      if (!code || !name || !team) {
        router.replace('/');
        return;
      }

      setGameCode(code);
      setPlayerName(name);
      setTeamName(team);
    };

    load();
  }, []);

  // Lytt på game-data
  useEffect(() => {
    if (!gameCode) return;

    const fetch = async () => {
      const { data } = await getGameByCode(gameCode);
      if (data) {
        setGameId(data.id);
        setChallenge(data.challenge);
        setChallengeStatus(data.challenge_state || '');
      }
    };

    fetch();

    const channel = supabase
      .channel(`single-challenge-${gameCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          const updated = payload.new;
          setChallenge(updated.challenge);
          setChallengeStatus(updated.challenge_status || '');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameCode]);

  // Host starter challenge
  const startChallenge = async () => {
    await supabase
      .from('games')
      .update({ challenge_status: 'in_progress' })
      .eq('id', gameId);
  };

  // Host velger vinner (dummy for nå)
  const completeChallenge = async () => {
    await supabase
      .from('games')
      .update({
        challenge_status: 'complete',
      })
      .eq('id', gameId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Utfordring:</Text>
      <Text style={styles.challengeText}>{challenge?.text || 'Ingen challenge'}</Text>

      <Text style={styles.status}>Status: {challengeStatus}</Text>

      {challengeStatus === 'betting' && (
        <View style={styles.betBox}>
          <Text>Hvor mange slurker vil du vedde?</Text>
          <TextInput
            keyboardType="numeric"
            value={slurksBet}
            onChangeText={setSlurksBet}
            style={styles.input}
          />
          <Text>Du har veddet {slurksBet} slurker 🍻</Text>
        </View>
      )}

      {playerName === 'Host' && challengeStatus === 'betting' && (
        <Button title="Start challenge" color="green" onPress={startChallenge} />
      )}

      {playerName === 'Host' && challengeStatus === 'in_progress' && (
        <Button title="Fullfør challenge" color="orange" onPress={completeChallenge} />
      )}

      {challengeStatus === 'complete' && (
        <Text style={{ marginTop: 20 }}>Challenge ferdig 🎉</Text>
      )}
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
  },
  challengeText: {
    fontSize: 18,
    marginVertical: 20,
  },
  status: {
    fontStyle: 'italic',
    marginBottom: 20,
  },
  betBox: {
    marginBottom: 20,
  },
  input: {
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
});
