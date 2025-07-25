import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { supabase } from '@/supabase';
import { getGameById } from '@/utils/games';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

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

  const handlePlayAgain = async () => {
    // Slett alle bets for dette spillet
    await supabase.from('bets').delete().eq('game_id', gameId);
    // Slett selve spillet
    await supabase.from('games').delete().eq('id', gameId);
    router.replace('/startGame');
  };

  return (
    <BackgroundWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#fff' }}>Spillet er ferdig!</Text>
        <Text style={{ fontSize: 18, marginBottom: 24, color: '#fff' }}>Slurker igjen per lag (må tas!):</Text>
        {teams.map(team => (
          <Text key={team.teamName} style={{ fontSize: 20, marginBottom: 8, color: '#fff' }}>
            {team.teamName}: {balances[team.teamName] ?? 0} slurker
          </Text>
        ))}
        {isHost && (
          <View style={{ flexDirection: 'row', marginTop: 32 }}>
            <Button
              label="Spill igjen"
              onPress={handlePlayAgain}
              style={{
                backgroundColor: '#000',
                flex: 1,
                marginRight: 8,
                paddingVertical: 15,
                borderRadius: 8,
              }}
              textStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#fff',
                textAlign: 'center',
              }}
            />
            <Button
              label="Avslutt spill"
              onPress={handleEndGame}
              style={{
                backgroundColor: '#B22222',
                flex: 1,
                marginLeft: 8,
                paddingVertical: 15,
                borderRadius: 8,
              }}
              textStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#fff',
                textAlign: 'center',
              }}
            />
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
} 