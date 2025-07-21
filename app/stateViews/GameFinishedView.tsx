import { supabase } from '@/supabase';
import { getGameById } from '@/utils/games';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function GameFinishedView({ gameId, isHost }: { gameId: string, isHost: boolean }) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [teams, setTeams] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchBalances() {
      const { data } = await getGameById(gameId);
      if (data) {
        setBalances(data.balances || {});
        setTeams(data.teams || []);
      }
    }
    fetchBalances();
  }, [gameId]);

  const handleEndGame = async () => {
    // Slett alle bets for dette spillet
    await supabase.from('bets').delete().eq('game_id', gameId);
    // Slett selve spillet
    await supabase.from('games').delete().eq('id', gameId);
    Alert.alert('Spillet er avsluttet og fjernet!');
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>Spillet er ferdig!</Text>
      <Text style={{ fontSize: 18, marginBottom: 24 }}>Slurker igjen per lag (må tas!):</Text>
      {teams.map(team => (
        <Text key={team.teamName} style={{ fontSize: 20, marginBottom: 8 }}>
          {team.teamName}: {balances[team.teamName] ?? 0} slurker
        </Text>
      ))}
      {isHost && (
        <Button title="Avslutt spill" onPress={handleEndGame} color="#B22222" />
      )}
    </View>
  );
} 