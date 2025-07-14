import Button from '@/components/Button';
import { supabase } from '@/supabase';
import { Challenge } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FinishedView({ challenge, gameId }: { challenge: Challenge, gameId: string }) {
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const checkIfHost = async () => {
      const name = await AsyncStorage.getItem('playerName');
      setIsHost(name === 'Host');
    };
    checkIfHost();
  }, []);

  const handleNextRound = async () => {
    // Hent eksisterende index og challenges fra databasen
    const { data, error } = await supabase
      .from('games')
      .select('current_challenge_index, challenges')
      .eq('id', gameId)
      .single();

    if (error || !data) {
      console.log('❌ Kunne ikke hente spilldata:', error);
      return;
    }

    const currentIndex = data.current_challenge_index;
    const totalChallenges = data.challenges.length;

    if (currentIndex + 1 >= totalChallenges) {
      alert('🎉 Ingen flere utfordringer!');
      return;
    }

    // Oppdater spill med ny index og sett state til 'betting'
    const { error: updateError } = await supabase
      .from('games')
      .update({
        current_challenge_index: currentIndex + 1,
        challenge_state: 'betting',
      })
      .eq('id', gameId);

    if (updateError) {
      console.log('❌ Feil ved oppdatering av spill:', updateError);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drikk!</Text>
      {isHost && (
        <Button
          label="Neste runde"
          onPress={handleNextRound}
          style={{ marginTop: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B0303',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
});
