import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { supabase } from '@/supabase';
import { getGameById } from '@/utils/games';
import { initializeGame } from '@/utils/status';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, View } from 'react-native';

import AppText from '@/components/AppText';

export default function GameFinishedView({ gameId, isHost }: { gameId: string, isHost: boolean }) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [teams, setTeams] = useState<any[]>([]);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Identisk fadeIn-funksjon som i ChallengeScreen
  const fadeIn = () => {
    return new Promise((resolve) => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        resolve(true);
      });
    });
  };

  useEffect(() => {
    fadeIn();
  }, [fadeAnim]);

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
    await supabase.from('bets').delete().eq('game_id', gameId);
    await supabase.from('games').delete().eq('id', gameId);
    Alert.alert('Spillet er avsluttet og fjernet!');
    router.replace('/');
  };

  const handlePlayAgain = async () => {
    await supabase.from('bets').delete().eq('game_id', gameId);
    const { data } = await getGameById(gameId);
    let newBalances: Record<string, number> = {};
    if (data && data.teams) {
      for (const team of data.teams) {
        newBalances[team.teamName] = 50;
      }
    }
    const gameCode = data?.code;
    await supabase.from('games').update({
      current_challenge_index: 0,
      challenge_state: 'waiting',
      challenge_winners: null,
      balances: newBalances,
      selected_teams: null,
      status: 'waiting',
    }).eq('id', gameId);
    await initializeGame(gameId);
    router.replace({ pathname: '/startGame', params: { code: gameCode } });
  };

  return (
    <BackgroundWrapper>
      <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, opacity: fadeAnim }}>
        <AppText style={styles.title}>Spillet er ferdig!</AppText>
        <AppText style={styles.underTitle}>Slurker igjen per lag (må tas!):</AppText>
        {teams.map(team => (
          <View key={team.teamName} style={styles.balanceItem}>
            <AppText style={{ fontSize: 20, marginBottom: 8, color: '#fff' }}>
              {team.teamName}: {balances[team.teamName] ?? 0} slurker
            </AppText>
          </View>
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
      </Animated.View>
    </BackgroundWrapper>
  );
} 


const styles = StyleSheet.create({
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    color: '#fff' 
  },
  underTitle: { 
    fontSize: 18, 
    marginBottom: 24, 
    color: '#D49712' 
  },



  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
})